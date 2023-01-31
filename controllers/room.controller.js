const db = require("../models");
const Room = db.rooms;
const Op = db.Sequelize.Op;
const dotenv = require("dotenv");
const chalk = require("chalk");
const moment = require("moment");
const purple = chalk.hex("#9900ff");

dotenv.config();

const apiKey = process.env.API_KEY;

exports.create = (req, res) => {
    const IP = req.header("X-FORWARDED-FOR") || req.socket.remoteAddress;

    if (req.header("API-Key") == apiKey) {
        // Validate request
        if (!req.body.name) {
            res.status(400).send({
                message: "시공하려는 고객의 별칭이 포함되지 않았습니다!",
            });
            console.log(
                `[${moment().format("YYYY-MM-DD HH:mm:ss.SSS")}] 🔴${chalk.red(
                    "Error:"
                )} ${chalk.yellow(
                    "Room 테이블"
                )}의 필수 데이터 name을 포함하지 않고 Create를 시도했습니다. (IP: ${IP})`
            );
            return;
        }

        function stringToDate(str) {
            let year = str.substr(0, 4);
            let month = str.substr(5, 2);
            let day = str.substr(8, 2);

            let hour = str.substr(11, 2);
            let minute = str.substr(14, 2);
            let second = str.substr(17, 2);
            let millisec = str.substr(20, 3);

            return new Date(
                year,
                month - 1,
                day,
                hour,
                minute,
                second,
                millisec
            );
        }

        function generateRandomString(stringLength = 6) {
            const characters =
                "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
            let randomString = "";

            for (let i = 0; i < stringLength; i++) {
                const randomNumber = Math.floor(
                    Math.random() * characters.length
                );
                randomString += characters.substring(
                    randomNumber,
                    randomNumber + 1
                );
            }

            return randomString;
        }

        const inviteCode = generateRandomString();
        let startDate = req.body.startDate;
        let endDate = req.body.endDate;

        if (startDate) {
            startDate = stringToDate(startDate);
        }
        if (endDate) {
            endDate = stringToDate(endDate);
        }

        // Create a Room
        const room = {
            name: req.body.name,
            startDate: startDate,
            endDate: endDate,
            warrantyTime: req.body.warrantyTime,
            inviteCode: inviteCode,
        };

        Room.create(room)
            .then((data) => {
                res.send(data);
                console.log(
                    `[${moment().format(
                        "YYYY-MM-DD HH:mm:ss.SSS"
                    )}] 🟢${chalk.green("Success:")} ${chalk.yellow(
                        "Room 테이블"
                    )}에 새로운 데이터가 성공적으로 추가되었습니다. (IP: ${IP})`
                );
            })
            .catch((err) => {
                res.status(500).send({
                    message: "새로운 Room을 추가하는 중에 문제가 발생했습니다.",
                    detail: err.message,
                });
                console.log(
                    `[${moment().format(
                        "YYYY-MM-DD HH:mm:ss.SSS"
                    )}] 🔴${chalk.red("Error:")} 새로운 ${chalk.yellow(
                        "Room"
                    )}을 추가하는 중에 문제가 발생했습니다. ${chalk.dim(
                        "상세정보: " + err.message
                    )} (IP: ${IP})`
                );
            });
    } else {
        res.status(401).send({ message: "Connection Fail" });
        console.log(
            `[${moment().format("YYYY-MM-DD HH:mm:ss.SSS")}] 🔴${chalk.red(
                "Error:"
            )} Connection Fail at ${chalk.yellow("POST /rooms")} (IP: ${IP})`
        );
    }
};

exports.update = (req, res) => {
    const id = req.params.id;
    const IP = req.header("X-FORWARDED-FOR") || req.socket.remoteAddress;

    if (req.header("API-Key") == apiKey) {
        Room.update(req.body, {
            where: { roomID: id },
            returning: true,
        })
            .then((data) => {
                if (data[0] == 1) {
                    res.send(data[1][0]);
                    console.log(
                        `[${moment().format(
                            "YYYY-MM-DD HH:mm:ss.SSS"
                        )}] 🟢${chalk.green("Success:")} ${chalk.yellow(
                            "Room 테이블"
                        )}의 ${chalk.yellow(
                            id + "번"
                        )} 데이터가 성공적으로 수정되었습니다. (IP: ${IP})`
                    );
                } else {
                    res.send({
                        message: `Room 테이블의 ${id}번 데이터를 수정할 수 없습니다. 해당 데이터를 찾을 수 없거나, request의 body가 비어있습니다.`,
                    });
                    console.log(
                        `[${moment().format(
                            "YYYY-MM-DD HH:mm:ss.SSS"
                        )}] 🔴${chalk.red("Error:")} ${chalk.yellow(
                            "Room 테이블"
                        )}의 ${chalk.yellow(
                            id + "번"
                        )} 데이터를 수정할 수 없습니다. 해당 데이터를 찾을 수 없거나, request의 body가 비어있습니다. (IP: ${IP})`
                    );
                }
            })
            .catch((err) => {
                res.status(500).send({
                    message: `Room 테이블의 ${id}번 데이터를 수정하는 중에 문제가 발생했습니다.`,
                    detail: err.message,
                });
                console.log(
                    `[${moment().format("YYYY-MM-DD HH:mm:ss.SSS")}] 🟣${purple(
                        "Error:"
                    )} ${chalk.yellow("Room 테이블")}의 ${chalk.yellow(
                        id + "번"
                    )} 데이터를 수정하는 중에 문제가 발생했습니다. ${chalk.dim(
                        "상세정보: " + err.message
                    )} (IP: ${IP})`
                );
            });
    } else {
        res.status(401).send({ message: "Connection Fail" });
        console.log(
            `[${moment().format("YYYY-MM-DD HH:mm:ss.SSS")}] 🔴${chalk.red(
                "Error:"
            )} Connection Fail at ${chalk.yellow(
                "PUT /rooms/" + id
            )} (IP: ${IP})`
        );
    }
};
