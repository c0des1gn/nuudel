db.createUser(
    {
        user: "dev_user",
        pwd: "4fu_%Dm+",
        roles: [
            {
                role: "readWrite",
                db: "dev_db"
            }
        ]
    }
);