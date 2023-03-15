import express from "express";
import dotenv from "dotenv";
import moment from "moment";
import chalk from "chalk";
const dateFormat = "YYYY-MM-DD HH:mm:ss.SSS";

dotenv.config();

const app = express();

app.get("/", (req, res) => {
    res.send("Hello, Express");
    console.log(
        `[${moment().format(dateFormat)}] ${chalk.green(
            "🟢 Success: "
        )} ${chalk.blue("/")}에 접속 했습니다. (IP: ${
            req.header("X-FORWARDED-FOR") || req.socket.remoteAddress
        })`
    );
});

app.get("/message", (req, res) => {
    const IP = req.header("X-FORWARDED-FOR") || req.socket.remoteAddress;
    res.status(200).send({ message: "Hi~ I'm Meenu~" });
    console.log(
        `[${moment().format(dateFormat)}] ${chalk.green(
            "🟢 Success: "
        )} ${chalk.blue("/message")}에 접속 했습니다. (IP: ${
            req.header("X-FORWARDED-FOR") || req.socket.remoteAddress
        })`
    );
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(PORT, "번 포트에서 대기 중");
});
