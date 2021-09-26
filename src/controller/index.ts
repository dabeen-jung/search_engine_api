import express from "express";
import schoolController from "./school.controller";

const router = express.Router();

/*  http://localhost:5000/schools/ 였는데
-> 잘리기 때문에 schoolController로 "/"만 넘어감*/
router.use("/schools", schoolController);

export default router;
