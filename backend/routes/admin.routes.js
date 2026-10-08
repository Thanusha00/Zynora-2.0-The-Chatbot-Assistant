const express = require("express");

const router = express.Router();

const adminController = require("../controllers/admin.controller");

const {
  authenticateToken,
  requireAdmin,
} = require("../middleware/auth.middleware");


/*
|--------------------------------------------------------------------------
| Admin Security
|--------------------------------------------------------------------------
*/

router.use(authenticateToken);
router.use(requireAdmin);


/*
|--------------------------------------------------------------------------
| User Management
|--------------------------------------------------------------------------
*/

// Get all normal users
router.get(
  "/users",
  adminController.getUsers
);


// Get individual user dashboard
router.get(
  "/users/:id/dashboard",
  adminController.getUserDashboard
);


/*
|--------------------------------------------------------------------------
| Knowledge Management
|--------------------------------------------------------------------------
*/

router.get(
  "/documents",
  adminController.getDocuments
);

router.post(
  "/documents",
  adminController.createDocument
);

router.put(
  "/documents/:id",
  adminController.updateDocument
);

router.delete(
  "/documents/:id",
  adminController.deleteDocument
);


/*
|--------------------------------------------------------------------------
| Monitoring
|--------------------------------------------------------------------------
*/

router.get(
  "/metrics",
  adminController.getMetrics
);

router.get(
  "/logs",
  adminController.getLogs
);


module.exports = router;