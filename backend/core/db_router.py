class SportsDatabaseRouter:
    sports_app_label = "sports"
    sports_db_alias = "sports"

    def db_for_read(self, model, **hints):
        if model._meta.app_label == self.sports_app_label:
            return self.sports_db_alias
        return None

    def db_for_write(self, model, **hints):
        if model._meta.app_label == self.sports_app_label:
            return self.sports_db_alias
        return None

    def allow_relation(self, obj1, obj2, **hints):
        sports_involved = self.sports_app_label in {obj1._meta.app_label, obj2._meta.app_label}
        if sports_involved:
            return obj1._meta.app_label == obj2._meta.app_label == self.sports_app_label
        return None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        if app_label == self.sports_app_label:
            return db == self.sports_db_alias
        if db == self.sports_db_alias:
            return False
        return None
