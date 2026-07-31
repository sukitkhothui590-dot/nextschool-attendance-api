SELECT 'CREATE DATABASE nextschool_attendance_test'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'nextschool_attendance_test')\gexec
