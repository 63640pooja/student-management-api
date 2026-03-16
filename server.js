const http = require("http")
const fs = require("fs")
const url = require("url")

const PORT = 5000

// function to read students from file
function readStudents() {
    try {
        const data = fs.readFileSync("students.json")
        return JSON.parse(data)
    } catch (err) {
        return []
    }
}

// function to save students into file
function saveStudents(data) {
    fs.writeFileSync("students.json", JSON.stringify(data, null, 2))
}

// function to check if student data is valid
function checkStudent(student) {

    if (!student.name || !student.email || !student.course || !student.year) {
        return "All fields are required"
    }

    if (!student.email.includes("@")) {
        return "Email is not valid"
    }

    if (student.year < 1 || student.year > 4) {
        return "Year must be between 1 and 4"
    }

    return null
}

const server = http.createServer((req, res) => {

    res.setHeader("Content-Type", "application/json")

    const parsedUrl = url.parse(req.url, true)
    const path = parsedUrl.pathname
    const method = req.method

    let students = readStudents()

    // GET all students
    if (method === "GET" && path === "/students") {

        res.writeHead(200)
        res.end(JSON.stringify({
            success: true,
            data: students
        }))
    }

    // GET single student
    else if (method === "GET" && path.startsWith("/students/")) {

        const id = path.split("/")[2]

        const student = students.find(s => s.id == id)

        if (!student) {
            res.writeHead(404)
            res.end(JSON.stringify({
                success: false,
                message: "Student not found"
            }))
            return
        }

        res.writeHead(200)
        res.end(JSON.stringify({
            success: true,
            data: student
        }))
    }

    // ADD new student
    else if (method === "POST" && path === "/students") {

        let body = ""

        req.on("data", chunk => {
            body += chunk
        })

        req.on("end", () => {

            const newStudent = JSON.parse(body)

            const error = checkStudent(newStudent)

            if (error) {
                res.writeHead(400)
                res.end(JSON.stringify({
                    success: false,
                    message: error
                }))
                return
            }

            newStudent.id = Date.now()

            students.push(newStudent)

            saveStudents(students)

            res.writeHead(201)
            res.end(JSON.stringify({
                success: true,
                data: newStudent
            }))
        })
    }

    // UPDATE student
    else if (method === "PUT" && path.startsWith("/students/")) {

        const id = path.split("/")[2]

        let body = ""

        req.on("data", chunk => {
            body += chunk
        })

        req.on("end", () => {

            const updatedData = JSON.parse(body)

            const studentIndex = students.findIndex(s => s.id == id)

            if (studentIndex === -1) {
                res.writeHead(404)
                res.end(JSON.stringify({
                    success: false,
                    message: "Student not found"
                }))
                return
            }

            students[studentIndex] = { ...students[studentIndex], ...updatedData }

            saveStudents(students)

            res.writeHead(200)
            res.end(JSON.stringify({
                success: true,
                data: students[studentIndex]
            }))
        })
    }

    // DELETE student
    else if (method === "DELETE" && path.startsWith("/students/")) {

        const id = path.split("/")[2]

        const newStudents = students.filter(s => s.id != id)

        if (newStudents.length === students.length) {
            res.writeHead(404)
            res.end(JSON.stringify({
                success: false,
                message: "Student not found"
            }))
            return
        }

        saveStudents(newStudents)

        res.writeHead(200)
        res.end(JSON.stringify({
            success: true,
            message: "Student deleted"
        }))
    }

    // if route not found
    else {
        res.writeHead(404)
        res.end(JSON.stringify({
            success: false,
            message: "Route not found"
        }))
    }

})

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})