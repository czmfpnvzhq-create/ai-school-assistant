"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TEACHER_TOOLS = exports.ADMIN_TOOLS = exports.ALL_TOOLS = void 0;
exports.isToolAllowedForRole = isToolAllowedForRole;
exports.ALL_TOOLS = [
    'get_students_by_class',
    'get_attendance_report',
    'add_student',
    'get_top_students',
    'get_class_summary',
    'get_fee_report',
    'get_notices',
];
exports.ADMIN_TOOLS = [...exports.ALL_TOOLS];
exports.TEACHER_TOOLS = [
    'get_students_by_class',
    'get_attendance_report',
    'get_top_students',
    'get_class_summary',
    'get_notices',
];
function isToolAllowedForRole(role, toolName) {
    const normalized = role?.toUpperCase();
    if (normalized === 'ADMIN') {
        return exports.ADMIN_TOOLS.includes(toolName);
    }
    if (normalized === 'TEACHER') {
        return exports.TEACHER_TOOLS.includes(toolName);
    }
    return false;
}
//# sourceMappingURL=tool-permissions.js.map