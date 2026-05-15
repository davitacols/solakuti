from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("news", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="article",
            name="editorial_status",
            field=models.CharField(
                choices=[("draft", "Draft"), ("review", "In Review"), ("published", "Published")],
                db_index=True,
                default="draft",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="article",
            name="seo_title",
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name="article",
            name="seo_description",
            field=models.CharField(blank=True, max_length=320),
        ),
        migrations.AddField(
            model_name="article",
            name="canonical_url",
            field=models.URLField(blank=True),
        ),
        migrations.AddField(
            model_name="article",
            name="og_image",
            field=models.ImageField(blank=True, null=True, upload_to="articles/og/"),
        ),
        migrations.RunSQL(
            "UPDATE news_article SET editorial_status = CASE WHEN is_published THEN 'published' ELSE 'draft' END;",
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
