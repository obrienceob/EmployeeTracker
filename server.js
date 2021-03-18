const mysql = require('mysql');
const inquirer = require('inquirer');
const cTable = require('console.table');

const promptQuestions = {
    viewAllEmployees: "View All Employees",
    viewByDepartment: "View All Employees By Department",
    viewByManager: "View All Employees By Manager",
    addEmployee: "Add An Employee",
    addDepartment: "Add a department",
    addRole: "Add a role",
    removeEmployee: "Remove An Employee",
    // updateRole: "Update Employee Role",
    viewAllRoles: "View All Roles",
    exit: "Exit"
};

const connection = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: 'password',
    database: 'employee_tracker'
});

connection.connect((err) => {
    if (err) throw err;
    runSearch();
});


const runSearch = () => {
    inquirer
    .prompt({
        name: 'action',
        type: 'list',
        message: 'What would you like to do?',
        choices: [
            promptQuestions.viewAllEmployees,
            promptQuestions.viewByDepartment,
            promptQuestions.viewByManager,
            promptQuestions.viewAllRoles,
            promptQuestions.addEmployee,
            promptQuestions.addDepartment,
            promptQuestions.addRole,
            promptQuestions.removeEmployee,
            // promptQuestions.updateRole,
            promptQuestions.exit
        ]
    })
    .then(answer => {
        console.log('answer', answer);
        switch (answer.action) {
            case promptQuestions.viewAllEmployees:
                viewAllEmployees();
                break;

            case promptQuestions.viewByDepartment:
                viewByDepartment();
                break;

            case promptQuestions.viewByManager:
                viewByManager();
                break;

            case promptQuestions.addEmployee:
                addEmployee();
                break;
            
            case promptQuestions.addDepartment:
                inquirer
                        .prompt([
                            {
                                name: "Department",
                                type: "input",
                                message: "Please enter the department you would like to add?",
                                validate: answer => {
                                    if (answer !== "") {
                                        return true;
                                    }
                                    return "Please enter at least one character.";
                                }
                            },

                        ]).then(answers => {
                            // Adds department to database
                            addDepartment(answers.Department);
                        })
                break;
            
                case promptQuestions.addRole:
                    inquirer
                        .prompt([
                            {
                                name: "role",
                                type: "input",
                                message: "Please enter the role's title.",
                            },
                            {
                                name: "salary",
                                type: "input",
                                message: "Please enter the role's salary.",

                            },
                            {
                                name: "department_id",
                                type: "input",
                                message: "Please enter the department id.",

                            }

                        ]).then(answers => {
                            // Adds role to database
                            addRole(answers.role, answers.salary, answers.department_id);
                        })
                    break;
            
            case promptQuestions.removeEmployee:
                remove('delete');
                break;

            case promptQuestions.updateRole:
                remove('role');
                break;

            case promptQuestions.viewAllRoles:
                viewAllRoles();
                break;

            case promptQuestions.exit:
                connection.end();
                break;
        }
    });
}

function viewAllEmployees() {
    const query = `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.d_name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM employee
    LEFT JOIN employee manager on manager.id = employee.manager_id
    INNER JOIN role ON (role.id = employee.role_id)
    INNER JOIN department ON (department.id = role.department_id)
    ORDER BY employee.id;`;
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.log('\n');
        console.log('VIEW ALL EMPLOYEES');
        console.log('\n');
        console.table(res);
        runSearch();
    });
};

function viewByDepartment() {
    const query = `SELECT department.d_name AS department, role.title, employee.id, employee.first_name, employee.last_name
    FROM employee
    LEFT JOIN role ON (role.id = employee.role_id)
    LEFT JOIN department ON (department.id = role.department_id)
    ORDER BY department.d_name;`;

    connection.query(query, (err, res) => {
        if (err) throw err;
        console.log('\n');
        console.log('VIEW EMPLOYEE BY DEPARTMENT');
        console.log('\n');
        console.table(res);
        runSearch();
    });
};


function viewByManager() {
    const query = `SELECT CONCAT(manager.first_name, ' ', manager.last_name) AS manager, department.d_name AS department, employee.id, employee.first_name, employee.last_name, role.title
    FROM employee
    LEFT JOIN employee manager on manager.id = employee.manager_id
    INNER JOIN role ON (role.id = employee.role_id && employee.manager_id != 'NULL')
    INNER JOIN department ON (department.id = role.department_id)
    ORDER BY manager;`;
    
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.log('\n');
        console.log('VIEW EMPLOYEE BY MANAGER');
        console.log('\n');
        console.table(res);
        runSearch();
    });
};

function viewAllRoles() {
    const query = `SELECT role.title, employee.id, employee.first_name, employee.last_name, department.d_name AS department
    FROM employee
    LEFT JOIN role ON (role.id = employee.role_id)
    LEFT JOIN department ON (department.id = role.department_id)
    ORDER BY role.title;`;
    
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.log('\n');
        console.log('VIEW EMPLOYEE BY ROLE');
        console.log('\n');
        console.table(res);
        runSearch();
    });
};

async function addEmployee() {
    const addname = await inquirer.prompt(askName());
    
    connection.query('SELECT role.id, role.title FROM role ORDER BY role.id;', async (err, res) => {
        if (err) throw err;
    
        const { role } = await inquirer.prompt([
            {
                name: 'role',
                type: 'list',
                choices: () => res.map(res => res.title),
                message: 'What is the employee role?: '
            }
        ]);
        let roleId;
        for (const row of res) {
            if (row.title === role) {
                roleId = row.id;
                continue;
            }
        }
    
    connection.query('SELECT * FROM employee', async (err, res) => {
        if (err) throw err;
        let choices = res.map(res => `${res.first_name} ${res.last_name}`);
        choices.push('none');
        let { manager } = await inquirer.prompt([
            {
                name: 'manager',
                type: 'list',
                choices: choices,
                message: 'Choose the employee Manager: '
            }
        ]);
        let managerId;
        let managerName;
        if (manager === 'none') {
            managerId = null;
        } else {
            for (const data of res) {
                data.fullName = `${data.first_name} ${data.last_name}`;
                if (data.fullName === manager) {
                    managerId = data.id;
                    managerName = data.fullName;
                    console.log(managerId);
                    console.log(managerName);
                    continue;
                }
            }
        }
        console.log('Employee has been added. Please view all employees to verify...');
        connection.query(
            'INSERT INTO employee SET ?',
            {
                first_name: addname.first,
                last_name: addname.last,
                role_id: roleId,
                manager_id: parseInt(managerId)
            },
            (err, res) => {
                if (err) throw err;
                runSearch();

            }
        );
    });
    });

}

function addDepartment(department) {

    var department = connection.query(
        "INSERT INTO department SET d_name = ?",
        [department],
        function (error, department) {
            if (error) throw error
        })

    departmentTable();
}

function departmentTable() {
    var depTable = connection.query("SELECT d_name FROM department;",


        function (error, depTable) {
            if (error) throw error;
            console.log('\n');
            console.table(depTable);
            runSearch();
        })
}

function addRole(title, salary, department_id) {

    var role = connection.query(
        "INSERT INTO role SET title = ?, salary = ?, department_id = ?",
        [title, salary, department_id],
        function (error, role) {
            if (error) throw error;
        })

    roleTable();
}

function roleTable() {
    var roleT = connection.query("SELECT title, salary, department_id FROM role;",

        function (error, roleT) {
            if (error) throw error
            console.log('\n')
            console.table(roleT);
            runSearch();
        })
}
    
function remove(input) {
    const promptQ = {
        yes: "yes",
        no: "no I don't (view all employees on the main option set to find ID)"
    };

    inquirer.prompt([
        {
            name: "action",
            type: "list",
            message: "In order to update an employee, an employee ID must be entered. View all employees to get" +
                " the employee ID. Do you know the employee ID?",
            choices: [promptQ.yes, promptQ.no]
        }
    ]).then(answer => {
        if (input === 'delete' && answer.action === "yes") removeEmployee();
        else if (input === 'role' && answer.action === "yes") updateRole();
        else if (input === 'manager' && answer.action === "yes") updateManager();
        else viewAllEmployees();
    });
};

async function removeEmployee() {

    const answer = await inquirer.prompt([
        {
            name: "first",
            type: "input",
            message: "Enter the employee ID you want to remove:  "
        }
    ]); 

    connection.query('DELETE FROM employee WHERE ?',
        {
            id: answer.first
        },
        function (err) {
            if (err) throw err;
        });

    console.log('Employee has been removed on the system!');
    runSearch();
};

function askId() {
    return ([
        {
            name: "name",
            type: "input",
            message: "What is the employe ID?:  "
        }
    ]);
};


async function updateRole() {
    const employeeId = await inquirer.prompt(askId());

    connection.query('SELECT role.id, role.title FROM role ORDER BY role.id;', async (err, res) => {
        if (err) throw err;
        const { role } = await inquirer.prompt([
            {
                name: 'role',
                type: 'list',
                choices: () => res.map(res => res.title),
                message: 'What is the new employee role?: '
            }
        ]);
        let roleId;
        for (const row of res) {
            if (row.title === role) {
                roleId = row.id;
                continue;
            }
        }
    
    connection.query(`UPDATE employee 
        SET role_id = ${roleId}
        WHERE employee.id = ${employeeId.name}`, async (err, res) => {
            if (err) throw err;
            console.log('Role has been updated..')
            runSearch();
        });
    });
}

function askName() {
    return ([
        {
            name: "first",
            type: "input",
            message: "Enter the first name: "
        },
        {
            name: "last",
            type: "input",
            message: "Enter the last name: "
        }
    ]);
}

