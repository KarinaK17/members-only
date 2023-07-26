const express = require("express");
const router = express.Router();
const controller = require("../controllers/controller");

router.get("/", controller.messages_display);

router.get("/sign-up", controller.sign_up_get);

router.post("/sign-up", controller.sign_up_post);

router.get("/log-in", controller.log_in_get);

router.post("/log-in", controller.log_in_post);

router.get("/log-out", controller.log_out);

router.get("/join-club", controller.join_club_get);

router.post("/join-club", controller.join_club_post);

router.get("/become-admin", controller.become_admin_get);

router.post("/become-admin", controller.become_admin_post);

router.get("/create-message", controller.create_message_get);

router.post("/create-message", controller.create_message_post);

router.post("/delete-message", controller.delete_message);

module.exports = router;
