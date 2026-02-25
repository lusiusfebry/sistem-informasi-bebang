import { Router } from 'express';
import * as messController from '../controllers/messController';
import * as facilityController from '../controllers/messFacilityController';
import * as damageController from '../controllers/messDamageController';
import * as cleaningController from '../controllers/messCleaningController';
import * as petugasController from '../controllers/messPetugasController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

// MESS
router.get('/', messController.getAllMess);
router.post('/', messController.createMess);
router.put('/:id', messController.updateMess);
router.delete('/:id', messController.deleteMess);

// ROOMS
router.get('/rooms/all', messController.getAllRooms);
router.get('/:messId/rooms', messController.getRoomsByMess);
router.post('/:messId/rooms', messController.createRoom);
router.put('/rooms/:id', messController.updateRoom);
router.delete('/rooms/:id', messController.deleteRoom);

// ASSIGNMENT & HISTORY
router.post('/assign', messController.assignKaryawan);
router.post('/unassign', messController.unassignKaryawan);
router.get('/assignments/history', messController.getAssignmentHistory);
router.get('/residents/current', messController.getCurrentResidents);

// FACILITIES
router.get('/facilities', facilityController.getAllFacilities);
router.post('/facilities', facilityController.createFacility);
router.put('/facilities/:id', facilityController.updateFacility);
router.delete('/facilities/:id', facilityController.deleteFacility);
router.post('/facilities/assign-to-room', facilityController.assignFacilityToRoom);
router.post('/facilities/remove-from-room', facilityController.removeFacilityFromRoom);

// PETUGAS
router.get('/petugas/all', petugasController.getAllPetugas);
router.post('/petugas', petugasController.createPetugas);
router.put('/petugas/:id', petugasController.updatePetugas);
router.delete('/petugas/:id', petugasController.deletePetugas);

// DAMAGE REPORTS
router.get('/damage-reports/all', damageController.getAllDamageReports);
router.post('/damage-reports', damageController.createDamageReport);
router.put('/damage-reports/:id/status', damageController.updateDamageReportStatus);
router.delete('/damage-reports/:id', damageController.deleteDamageReport);

// CLEANING SCHEDULES
router.get('/cleaning/schedules', cleaningController.getCleaningSchedules);
router.post('/cleaning/schedules', cleaningController.createCleaningSchedule);
router.put('/cleaning/schedules/:id/status', cleaningController.updateCleaningStatus);

// REPORTS
router.get('/reports/occupancy', messController.getOccupancyReport);
router.get('/reports/maintenance', messController.getMaintenanceReport);

export default router;
