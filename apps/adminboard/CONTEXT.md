# Adminboard

Internal admin dashboard for managing platform resources and operational content.

## Language

**Bucket Object**:
A file-like asset stored in the platform media bucket and served through the Virtality CDN.
_Avoid_: S3 resource, file resource

**Object Key**:
The slash-separated, URL-safe name of a bucket object. Admin-created object keys keep a readable filename stem and include a unique suffix.
_Avoid_: File path, S3 path

**CDN URL**:
The public Virtality CDN address for a bucket object.
_Avoid_: File path, S3 URL

**Object Replacement**:
A content update that creates a new bucket object instead of changing the contents at an existing CDN URL.
_Avoid_: Overwrite

**Referenced Bucket Object**:
A bucket object whose CDN URL or object key is used by another platform resource.
_Avoid_: Attached file

**Folder**:
A navigational grouping of bucket objects by shared path-like location. Empty folders are not independent admin-managed things.
_Avoid_: Directory

**Folder Operation**:
An admin action applied to every bucket object in a folder.
_Avoid_: Folder CRUD
