from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("news", "0004_articlerevision"),
    ]

    operations = [
        migrations.AddField(
            model_name="article",
            name="featured_video",
            field=models.FileField(blank=True, null=True, upload_to="articles/videos/"),
        ),
        migrations.AddField(
            model_name="article",
            name="featured_media_type",
            field=models.CharField(
                choices=[("image", "Image"), ("video", "Video")],
                db_index=True,
                default="image",
                max_length=20,
            ),
        ),
    ]
