import express from "express";
import schoolController from "./school.controller";
import searchController from "./search.controller";

const router = express.Router();

/*  http://localhost:5000/schools/ 였는데
-> 잘리기 때문에 schoolController로 "/"만 넘어감*/
router.use("/schools", schoolController);
router.use("/search", searchController);

export default router;
