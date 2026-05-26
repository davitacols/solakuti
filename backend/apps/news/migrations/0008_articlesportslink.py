from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("news", "0007_backfill_published_at"),
    ]

    operations = [
        migrations.CreateModel(
            name="ArticleSportsLink",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("target_type", models.CharField(choices=[("competition", "Competition"), ("team", "Team"), ("fixture", "Fixture")], max_length=20)),
                ("target_id", models.CharField(max_length=120)),
                ("target_slug", models.SlugField(blank=True, max_length=180)),
                ("target_name", models.CharField(blank=True, max_length=180)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("article", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="sports_links", to="news.article")),
            ],
            options={
                "ordering": ["target_type", "target_name"],
            },
        ),
        migrations.AddConstraint(
            model_name="articlesportslink",
            constraint=models.UniqueConstraint(fields=("article", "target_type", "target_id"), name="unique_article_sports_link"),
        ),
        migrations.AddIndex(
            model_name="articlesportslink",
            index=models.Index(fields=["target_type", "target_id"], name="news_articl_target__8cae98_idx"),
        ),
        migrations.AddIndex(
            model_name="articlesportslink",
            index=models.Index(fields=["target_type", "target_slug"], name="news_articl_target__ad42fc_idx"),
        ),
    ]
