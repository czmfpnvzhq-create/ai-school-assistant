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
exports.FeesController = void 0;
const common_1 = require("@nestjs/common");
const fees_service_1 = require("./fees.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let FeesController = class FeesController {
    feesService;
    constructor(feesService) {
        this.feesService = feesService;
    }
    async findAll(classId, paidStatus) {
        const classIdNum = classId ? parseInt(classId, 10) : undefined;
        return this.feesService.findAll(classIdNum, paidStatus);
    }
    async pay(id) {
        return this.feesService.markAsPaid(id);
    }
};
exports.FeesController = FeesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)("classId")),
    __param(1, (0, common_1.Query)("paid")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FeesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Put)(":id/pay"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], FeesController.prototype, "pay", null);
exports.FeesController = FeesController = __decorate([
    (0, common_1.Controller)("fees"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [fees_service_1.FeesService])
], FeesController);
//# sourceMappingURL=fees.controller.js.map