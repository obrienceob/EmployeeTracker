/* Seed file for table data */
use employee_tracker;

INSERT INTO department
    (d_name)
VALUES
    ('Sales'),
    ('Engineering'),
    ('Finance'),
    ('Legal');

INSERT INTO role
    (title, salary, department_id)
VALUES
    ('Sales Lead', 110000, 1),
    ('Salesperson', 85000, 1),
    ('Lead Engineer', 160000, 2),
    ('Software Engineer', 120000, 2),
    ('Account Manager', 160000, 3),
    ('Accountant', 125000, 3),
    ('Legal Team Lead', 200000, 4),
    ('Lawyer', 175000, 4);

INSERT INTO employee
    (first_name, last_name, role_id, manager_id)
VALUES
    ('Ron', 'Swanson', 1, NULL),
    ('April', 'Ludgate', 2, 1),
    ('Ben', 'Wyatt', 3, NULL),
    ('Andy', 'Dwyer', 4, 3),
    ('Leslie', 'Knope', 5, NULL),
    ('Ann', 'Perkins', 6, 5),
    ('Jerry', 'Gergich', 7, NULL),
    ('Tom', 'Haverford', 8, 7);