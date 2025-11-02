    import express from "express";
    import { list, readAll } from "../controllers/sellerNotificationController.js";
    import sellerAuth from "../middlewares/sellerAuth.js";

    const router = express.Router();

    router.get('/notifications', sellerAuth, list);
    router.put('/notifications/read-all', sellerAuth, readAll);

    export default router;
