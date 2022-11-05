const db = require("../models");
const Worker = db.workers;
const Op = db.Sequelize.Op;

exports.create = (req, res) => {
    // Validate request
    if (!req.body.userIdentifier || !req.body.name || !req.body.email) {
        res.status(400).send({
            message: "Content can not be empty!",
        });
        return;
    }

    // Create a Worker
    const worker = {
        userIdentifier: req.body.userIdentifier,
        name: req.body.name,
        email: req.body.email,
        number: req.body.number,
    };

    Worker.create(worker)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message ||
                    "Some error occurred while creating the Worker.",
            });
        });
};

exports.findAll = (req, res) => {
    const title = req.query.title;
    var condition = title ? { title: { [Op.iLike]: `%${title}%` } } : null;

    Worker.findAll({ where: condition })
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message ||
                    "Some error occurred while retrieving workers.",
            });
        });
};

exports.findOne = (req, res) => {
    const id = req.params.id;

    Worker.findByPk(id)
        .then((data) => {
            if (data) {
                res.send(data);
            } else {
                res.status(400).send({
                    message: `Cannot find Worker with id=${id}.`,
                });
            }
        })
        .catch((err) => {
            res.status(500).send({
                message: "Error retrieving Worker with id=" + id,
            });
        });
};

exports.update = (req, res) => {
    const id = req.params.id;

    Worker.update(req.body, {
        where: { workerID: id },
    })
        .then((num) => {
            if (num == 1) {
                res.send({
                    message: "Worker was updated successfully.",
                });
            } else {
                res.send({
                    message: `Cannot update Worker with id=${id}. Maybe Worker was not found or req.body is empty!`,
                });
            }
        })
        .catch((err) => {
            res.status(500).send({
                message: "Error updating Worker with id=" + id,
            });
        });
};

exports.delete = (req, res) => {
    const id = req.params.id;

    Worker.destroy({
        where: { workerID: id },
    })
        .then((num) => {
            if (num == 1) {
                res.send({
                    message: "Worker was deleted successfully!",
                });
            } else {
                res.send({
                    message: `Cannot delete Worker with id=${id}. Maybe Worker was not found!`,
                });
            }
        })
        .catch((err) => {
            res.status(500).send({
                message: "Could not delete Worker with id=" + id,
            });
        });
};
