from django.db.models import Model, CharField, EmailField

class User(Model):
    username = CharField(max_length=255)
    email = EmailField()
    password = CharField(max_length=255)

    def __str__(self):
        return self.username