from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("news", "0002_article_editorial_seo"),
    ]

    operations = [
        migrations.AlterField(
            model_name="comment",
            name="content",
            field=models.TextField(max_length=1200),
        ),
        migrations.AlterField(
            model_name="comment",
            name="is_approved",
            field=models.BooleanField(db_index=True, default=True),
        ),
        migrations.RunSQL(
            "UPDATE news_comment SET is_approved = TRUE;",
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
