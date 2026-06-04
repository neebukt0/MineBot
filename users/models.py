from django.db.models import Model, CharField, EmailField

class User(Model):
    id = CharField(max_length=255, primary_key=True)
    username = CharField(max_length=255)
    email = EmailField()
    password_1 = CharField(max_length=255)
    password_2 = CharField(max_length=255)

    def __str__(self):
        return self.username
    

    @classmethod
    def check_password(cls, password_1, password_2):
        return password_1 == password_2
        
