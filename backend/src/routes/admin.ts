import { Router } from "express";

import { getAllUsersController } from "@/http/controllers/admin/getAllUsersController";
import { deleteUserController } from "@/http/controllers/admin/deleteUserController";
import { deleteUserInstanceController } from "@/http/controllers/admin/deleteUserInstanceController";
import { changeUserCredentialsController } from "@/http/controllers/admin/changeUserCredentialsController";

const router = Router();

router.get("/users", getAllUsersController);
router.delete("/users/:id", deleteUserController);
router.delete("/users/:id/instance", deleteUserInstanceController);
router.put("/users/:id/credentials", changeUserCredentialsController);

export default router;
