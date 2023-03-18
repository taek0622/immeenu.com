import express from "express";
import dotenv from "dotenv";
import moment from "moment";
import chalk from "chalk";
import db from "./models/index.js";

const dateFormat = "YYYY-MM-DD HH:mm:ss.SSS";
const purple = chalk.hex("#9900ff");
const success = `🟢${chalk.green("Success:")}`;
const badAccessError = `🔴${chalk.red("Error:")}`;
const unknownError = `🟣${purple("Error:")}`;
const app = express();

dotenv.config();

const apiKey = process.env.API_KEY;
const ipHeaderField = "X-FORWARDED-FOR";
const apiKeyHeaderField = "x-api-key";

app.use(express.json());

db.connect();

app.get("/", (req, res) => {
    const IP = req.header(ipHeaderField) || req.socket.remoteAddress;

    res.send("Hello, This is immeenu.com");
    console.log(
        `[${moment().format(dateFormat)}] ${success} ${chalk.yellow(
            "GET /"
        )}에 접속 했습니다. (IP: ${IP})`
    );
});

app.get("/message", (req, res) => {
    const IP = req.header(ipHeaderField) || req.socket.remoteAddress;

    res.status(200).send({ message: "Hi~ I'm Meenu~" });
    console.log(
        `[${moment().format(dateFormat)}] ${success} ${chalk.yellow(
            "GET /message"
        )}에 접속 했습니다. (IP: ${IP})`
    );
});

app.get("/attendances", (req, res) => {
    const IP = req.header(ipHeaderField) || req.socket.remoteAddress;

    if (req.header(apiKeyHeaderField) == apiKey) {
        const id = req.query.id;
        const name = req.query.name;

        let query = `SELECT * FROM attendance ORDER BY id`;

        if (id || name) {
            query += ` WHERE `;
        }

        if (id) {
            query += `id=${id}`;
        }

        if (id && name) {
            query += ` AND `;
        }

        if (name) {
            query += `name='${name}'`;
        }

        db.query(query)
            .then((data) => {
                res.status(200).send(data.rows);
                console.log(
                    `[${moment().format(
                        dateFormat
                    )}] ${success} 모든 출석 정보를 성공적으로 조회했습니다. (IP: ${IP})`
                );
            })
            .catch((err) => {
                res.status(500).send({
                    message: `모든 출석 정보를 조회하던 중에 문제가 발생했습니다.`,
                    errorInfo: err.message,
                });
                console.log(
                    `[${moment().format(
                        dateFormat
                    )}] ${unknownError} 모든 출석 정보를 조회하는 중에 문제가 발생했습니다. ${chalk.dim(
                        `상세정보: ${err.message}`
                    )} (IP: ${IP})`
                );
            });
    } else {
        res.status(403).send({ message: "Connection Fail" });
        console.log(
            `[${moment().format(
                dateFormat
            )}] ${badAccessError} Connection Fail at ${chalk.yellow(
                `GET /attendances`
            )} (IP: ${IP})`
        );
    }
});

app.get("/attendances/:id", (req, res) => {
    const IP = req.header(ipHeaderField) || req.socket.remoteAddress;

    if (req.header(apiKeyHeaderField) == apiKey) {
        const id = req.params.id;

        const query = `SELECT * FROM attendance WHERE id=${id}`;

        db.query(query)
            .then((data) => {
                if (data.rows[0]) {
                    res.status(200).send(data.rows[0]);
                    console.log(
                        `[${moment().format(
                            dateFormat
                        )}] ${success} ${chalk.yellow(
                            `${id}등 ${data.rows[0].name}`
                        )}의 출석 정보를 성공적으로 조회했습니다. (IP: ${IP})`
                    );
                } else {
                    res.status(404).send({
                        message: `출석 정보에서 ${id}등을 찾을 수 없습니다.`,
                    });
                    console.log(
                        `[${moment().format(
                            dateFormat
                        )}] ${badAccessError} ${chalk.yellow(
                            `${id}등`
                        )}의 출석 정보 조회를 시도했으나, 해당 등수가 존재하지 않습니다. (IP: ${IP})`
                    );
                }
            })
            .catch((err) => {
                res.status(500).send({
                    message: `${id}등의 출석 정보를 조회하던 중에 문제가 발생했습니다.`,
                    errorInfo: err.message,
                });
                console.log(
                    `[${moment().format(
                        dateFormat
                    )}] ${unknownError} ${chalk.yellow(
                        `${id}등`
                    )}의 출석 정보를 조회하는 중에 문제가 발생했습니다. ${chalk.dim(
                        `상세정보: ${err.message}`
                    )} (IP: ${IP})`
                );
            });
    } else {
        res.status(403).send({ message: "Connection Fail" });
        console.log(
            `[${moment().format(
                dateFormat
            )}] ${badAccessError} Connection Fail at ${chalk.yellow(
                `GET /attendances/${id}`
            )} (IP: ${IP})`
        );
    }
});

app.post("/attendances", (req, res) => {
    const IP = req.header(ipHeaderField) || req.socket.remoteAddress;

    if (req.header(apiKeyHeaderField) == apiKey) {
        const name = req.body.name;
        const query = `INSERT INTO attendance (name) VALUES ('${name}')`;

        if (!name) {
            res.status(400).send({ message: "이름을 입력하지 않았습니다." });
            console.log(
                `[${moment().format(
                    dateFormat
                )}] ${badAccessError} 이름을 입력하지 않고 출석 정보 추가를 시도했습니다. (IP: ${IP})`
            );
            return;
        }

        db.query(query)
            .then((_) => {
                db.query(`SELECT * FROM attendance WHERE name='${name}'`).then(
                    (data) => {
                        res.status(200).send(data.rows[data.rows.length - 1]);
                        console.log(
                            `[${moment().format(
                                dateFormat
                            )}] ${success} ${chalk.yellow(
                                `${
                                    data.rows[data.rows.length - 1].id
                                }등 ${name}`
                            )}의 출석 정보를 성공적으로 추가했습니다. (IP: ${IP})`
                        );
                    }
                );
            })
            .catch((err) => {
                res.status(500).send({
                    message: `${name}의 출석 정보를 추가하는 중에 문제가 발생했습니다.`,
                    errorInfo: err.message,
                });
                console.log(
                    `[${moment().format(
                        dateFormat
                    )}] ${unknownError} ${chalk.yellow(
                        name
                    )}의 출석 정보를 추가하는 중에 문제가 발생했습니다. ${chalk.dim(
                        `상세정보: ${err.message}`
                    )} (IP: ${IP})`
                );
            });
    } else {
        res.status(403).send({ message: "Connection Fail" });
        console.log(
            `[${moment().format(
                dateFormat
            )}] ${badAccessError} Connection Fail at ${chalk.yellow(
                `POST /attendances`
            )} (IP: ${IP})`
        );
    }
});

app.put("/attendances/:id", (req, res) => {
    const IP = req.header(ipHeaderField) || req.socket.remoteAddress;

    if (req.header(apiKeyHeaderField) == apiKey) {
        const id = req.params.id;
        const name = req.body.name;
        const query = `UPDATE attendance SET name='${name}' WHERE id=${id}`;

        if (!name) {
            res.status(400).send({ message: "이름을 입력하지 않았습니다." });
            console.log(
                `[${moment().format(
                    dateFormat
                )}] ${badAccessError} 이름을 입력하지 않고 출석 정보 수정을 시도했습니다. (IP: ${IP})`
            );
            return;
        }

        db.query(`SELECT * FROM attendance WHERE id=${id}`)
            .then((data) => {
                if (data.rows[0]) {
                    let newData = data.rows[0];
                    db.query(query).then((_) => {
                        newData.oldName = newData.name;
                        newData.name = name;
                        res.status(200).send(newData);
                        console.log(
                            `[${moment().format(
                                dateFormat
                            )}] ${success} 출석 정보에서 ${chalk.yellow(
                                `${id}등`
                            )}의 이름을 ${chalk.dim(
                                data.rows[0].name
                            )}에서 ${chalk.yellow(
                                name
                            )}으로 성공적으로 수정했습니다. (IP: ${IP})`
                        );
                    });
                } else {
                    res.status(404).send({
                        message: `출석 정보에서 ${id}등을 찾을 수 없습니다.`,
                    });
                    console.log(
                        `[${moment().format(
                            dateFormat
                        )}] ${badAccessError} 출석 정보에서 ${chalk.yellow(
                            `${id}등`
                        )}의 이름을 ${chalk.yellow(
                            name
                        )}으로 수정하려고 시도했으나, 해당 등수가 존재하지 않습니다. (IP: ${IP})`
                    );
                }
            })
            .catch((err) => {
                res.status(500).send({
                    message: `출석 정보에서 ${id}등의 이름을 ${name}으로 수정하는 중에 문제가 발생했습니다.`,
                    errorInfo: err.message,
                });
                console.log(
                    `[${moment().format(
                        dateFormat
                    )}] ${unknownError} 출석 정보에서 ${chalk.yellow(
                        `${id}등`
                    )}의 이름을 ${chalk.yellow(
                        name
                    )}으로 수정하는 중에 문제가 발생했습니다. ${chalk.dim(
                        `상세정보: ${err.message}`
                    )} (IP: ${IP})`
                );
            });
    } else {
        res.status(403).send({ message: "Connection Fail" });
        console.log(
            `[${moment().format(
                dateFormat
            )}] ${badAccessError} Connection Fail at ${chalk.yellow(
                `PUT /attendances/${id}`
            )} (IP: ${IP})`
        );
    }
});

app.delete("/attendances/:id", (req, res) => {
    const IP = req.header(ipHeaderField) || req.socket.remoteAddress;

    if (req.header(apiKeyHeaderField) == apiKey) {
        const id = req.params.id;
        const query = `DELETE FROM attendance WHERE id=${id}`;

        db.query(`SELECT * FROM attendance WHERE id=${id}`)
            .then((data) => {
                if (data.rows[0]) {
                    db.query(query).then((_) => {
                        res.status(200).send(data.rows[0]);
                        console.log(
                            `[${moment().format(
                                dateFormat
                            )}] ${success} ${chalk.yellow(
                                `${id}등 ${data.rows[0].name}`
                            )}의 출석 정보를 성공적으로 삭제했습니다. (IP: ${IP})`
                        );
                    });
                } else {
                    res.status(404).send({
                        message: `출석 정보에서 ${id}등을 찾을 수 없습니다.`,
                    });
                    console.log(
                        `[${moment().format(
                            dateFormat
                        )}] ${badAccessError} ${chalk.yellow(
                            `${id}등`
                        )}의 출석 정보를 삭제하려고 시도했으나, 해당 등수가 존재하지 않습니다. (IP: ${IP})`
                    );
                }
            })
            .catch((err) => {
                res.status(500).send({
                    message: `${id}등의 출석 정보를 삭제하는 중에 문제가 발생했습니다.`,
                    errorInfo: err.message,
                });
                console.log(
                    `[${moment().format(
                        dateFormat
                    )}] ${unknownError} ${chalk.yellow(
                        `${id}등`
                    )}의 출석 정보를 삭제하는 중에 문제가 발생했습니다. ${chalk.dim(
                        `상세정보: ${err.message}`
                    )} (IP: ${IP})`
                );
            });
    } else {
        res.status(403).send({ message: "Connection Fail" });
        console.log(
            `[${moment().format(
                dateFormat
            )}] ${badAccessError} Connection Fail at ${chalk.yellow(
                `DELETE /attendances/${id}`
            )} (IP: ${IP})`
        );
    }
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`서버가 ${PORT}번 포트에서 실행되었습니다.`);
});
