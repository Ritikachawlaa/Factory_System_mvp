import sqlite3

conn = sqlite3.connect('employees.db')
c = conn.cursor()

# Check if role column exists
c.execute("PRAGMA table_info(users)")
columns = [info[1] for info in c.fetchall()]

if 'role' not in columns:
    print("Adding 'role' column to users table...")
    c.execute("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'admin'")
    conn.commit()
    print("Role column added!")
else:
    print("Role column already exists")

# Update admin to superadmin
print("Updating admin user to superadmin...")
c.execute("UPDATE users SET role='superadmin' WHERE username='admin'")
conn.commit()

# Show all users
c.execute("SELECT username, role FROM users")
users = c.fetchall()

print("\nUsers in database:")
for username, role in users:
    print(f"  {username}: {role}")

conn.close()
print("\nDone!")
