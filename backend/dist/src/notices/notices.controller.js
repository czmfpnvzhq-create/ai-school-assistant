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
exports.NoticesController = void 0;
const common_1 = require("@nestjs/common");
const notices_service_1 = require("./notices.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let NoticesController = class NoticesController {
    noticesService;
    constructor(noticesService) {
        this.noticesService = noticesService;
    }
    async findAll() {
        return this.noticesService.findAll();
    }
    async create(body, req) {
        if (req.user.role !== "ADMIN") {
            throw new common_1.ForbiddenException("Only admins can post notices");
        }
        return this.noticesService.create(body.title, body.content, req.user.name);
    }
    async delete(id, req) {
        if (req.user.role !== "ADMIN") {
            throw new common_1.ForbiddenException("Only admins can delete notices");
        }
        return this.noticesService.delete(id);
    }
};
exports.NoticesController = NoticesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NoticesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], NoticesController.prototype, "create", null);
__decorate([
    (0, common_1.Delete)(":id"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], NoticesController.prototype, "delete", null);
exports.NoticesController = NoticesController = __decorate([
    (0, common_1.Controller)("notices"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [notices_service_1.NoticesService])
], NoticesController);
//# sourceMappingURL=notices.controller.js.map