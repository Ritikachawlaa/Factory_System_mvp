import sqlite3

conn = sqlite3.connect('employees.db')
c = conn.cursor()

# Update admin to superadmin
c.execute("UPDATE users SET role='superadmin' WHERE username='admin'")
conn.commit()

# Show all users
c.execute("SELECT username, role FROM users")
users = c.fetchall()

print("Users in database:")
for username, role in users:
    print(f"  {username}: {role}")

conn.close()
print("\nAdmin role updated to superadmin!")
