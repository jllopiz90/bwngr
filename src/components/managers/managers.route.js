import { Router } from "express";
import ManagerController from './managers.controller';

const router = new Router()

// associate put, delete, and get(id)
router.route("/").get(ManagerController.getAllManagers)
router.route("/:manager").get(ManagerController.getManager)

export default router;