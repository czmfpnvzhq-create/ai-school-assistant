"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GradesController = void 0;
const common_1 = require("@nestjs/common");
const grades_service_1 = require("./grades.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let GradesController = class GradesController {
    gradesService;
    constructor(gradesService) {
        this.gradesService = gradesService;
    }
    async getGrades(classId, subject, examDate) {
        const parsedClassId = parseInt(classId, 10);
        return this.gradesService.getGrades(parsedClassId, subject, examDate);
    }
    async saveGrades(body) {
        return this.gradesService.saveGrades(body.grades);
    }
    async getGradesReport(classId, subject) {
        const parsedClassId = classId && classId !== "All" ? parseInt(classId, 10) : undefined;
        const filterSubject = subject && subject !== "All" ? subject : undefined;
        return this.gradesService.getGradesReport(parsedClassId, filterSubject);
    }
};
exports.GradesController = GradesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)("classId")),
    __param(1, (0, common_1.Query)("subject")),
    __param(2, (0, common_1.Query)("examDate")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], GradesController.prototype, "getGrades", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GradesController.prototype, "saveGrades", null);
__decorate([
    (0, common_1.Get)("report"),
    __param(0, (0, common_1.Query)("classId")),
    __param(1, (0, common_1.Query)("subject")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], GradesController.prototype, "getGradesReport", null);
exports.GradesController = GradesController = __decorate([
    (0, common_1.Controller)("grades"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [grades_service_1.GradesService])
], GradesController);
//# sourceMappingURL=grades.controller.js.map