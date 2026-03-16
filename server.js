const http = require('http');
const url = require('url');

let students = [];

const server = http.createServer((req, res) => {

    res.setHeader('Content-Type', 'application/json');

    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const method = req.method;

    // GET all students
    if (path === '/students' && method === 'GET') {

        res.end(JSON.stringify(students));

    }

    // POST create student
    else if (path === '/students' && method === 'POST') {

        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {

            const data = JSON.parse(body);

            const student = {
                id: Date.now().toString(),
                name: data.name,
                email: data.email,
                course: data.course,
                year: data.year
            };

            students.push(student);

            res.statusCode = 201;
            res.end(JSON.stringify(student));
        });

    }

    // GET single student
    else if (path.startsWith('/students/') && method === 'GET') {

        const id = path.split('/')[2];

        const student = students.find(s => s.id === id);

        if (!student) {

            res.statusCode = 404;
            return res.end(JSON.stringify({
                message: "Student not found"
            }));

        }

        res.end(JSON.stringify(student));

    }

    // PUT update student
    else if (path.startsWith('/students/') && method === 'PUT') {

        const id = path.split('/')[2];

        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {

            const data = JSON.parse(body);

            const student = students.find(s => s.id === id);

            if (!student) {

                res.statusCode = 404;
                return res.end(JSON.stringify({
                    message: "Student not found"
                }));

            }

            student.name = data.name;
            student.email = data.email;
            student.course = data.course;
            student.year = data.year;

            res.end(JSON.stringify(student));

        });

    }

    // DELETE student
    else if (path.startsWith('/students/') && method === 'DELETE') {

        const id = path.split('/')[2];

        students = students.filter(s => s.id !== id);

        res.end(JSON.stringify({
            message: "Student deleted"
        }));

    }

    else {

        res.statusCode = 404;

        res.end(JSON.stringify({
            message: "Route not found"
        }));

    }

});

server.listen(5000, () => {
    console.log("Server running on port 5000");
});