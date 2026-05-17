from cloudinary_storage.storage import MediaCloudinaryStorage, RESOURCE_TYPES, VideoMediaCloudinaryStorage


class MixedMediaCloudinaryStorage(MediaCloudinaryStorage):
    VIDEO_EXTENSIONS = {"mp4", "webm", "mov", "m4v", "avi", "mpeg", "mpg", "ogv"}
    IMAGE_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "webp", "avif"}

    def _get_resource_type(self, name):
        extension = name.rsplit(".", 1)[-1].lower() if "." in name else ""
        if extension in self.VIDEO_EXTENSIONS:
            return RESOURCE_TYPES["VIDEO"]
        if extension in self.IMAGE_EXTENSIONS:
            return RESOURCE_TYPES["IMAGE"]
        return RESOURCE_TYPES["IMAGE"]


class SolakutiVideoCloudinaryStorage(VideoMediaCloudinaryStorage):
    pass
