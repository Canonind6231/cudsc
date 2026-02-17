import React, { createContext, useContext, useState, useCallback } from 'react';

export type Language = 'en' | 'th';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// English translations
const en: Record<string, string> = {
  // Header
  'header.newRequest': 'New Request',
  'header.requester': 'Requester',
  'header.reviewer': 'Reviewer',
  'header.approver': 'Approver',
  'header.requesterView': 'Requester View',
  'header.reviewerView': 'Reviewer View',
  'header.approverView': 'Approver View',
  'header.logout': 'Logout',
  
  // Stats
  'stats.totalProjects': 'Total Projects',
  'stats.underReview': 'Under Review',
  'stats.pendingApproval': 'Pending Approval',
  'stats.approved': 'Approved',
  'stats.rejected': 'Rejected',
  
  // Projects
  'projects.title': 'Project Requests',
  'projects.viewingAs': 'Viewing as:',
  'projects.all': 'All',
  'projects.noProjects': 'No projects found in this category',
  'projects.search': 'Search projects...',
  'projects.files': 'file(s)',
  
  // Status
  'status.review': 'Under Review',
  'status.pendingApproval': 'Pending Approval',
  'status.approved': 'Approved',
  'status.rejected': 'Rejected',
  
  // Project Detail
  'detail.projectDetails': 'Project Details',
  'detail.details': 'Details',
  'detail.history': 'History',
  'detail.requester': 'Requester',
  'detail.department': 'Department',
  'detail.budget': 'Budget',
  'detail.submitted': 'Submitted',
  'detail.lastUpdated': 'Last Updated',
  'detail.description': 'Description',
  'detail.attachments': 'Attachments',
  'detail.reviewerComment': 'Reviewer Comment',
  'detail.approverComment': 'Approver Comment',
  'detail.noComment': 'No comment provided yet.',
  'detail.addComment': 'Add your comment',
  'detail.commentPlaceholder': 'Enter your comment or feedback...',
  'detail.forward': 'Forward to Approver',
  'detail.approve': 'Approve',
  'detail.reject': 'Reject',
  'detail.close': 'Close',
  'detail.comments': 'Comments',
  'detail.downloadError': 'Failed to download file',
  'detail.noHistory': 'No activity history yet',
  
  // Audit Log
  'audit.activityHistory': 'Activity History',
  'audit.created': 'Project created',
  'audit.submitted': 'Request submitted',
  'audit.forwarded': 'Forwarded to approver',
  'audit.approved': 'Project approved',
  'audit.rejected': 'Project rejected',
  'audit.commented': 'Added comment',
  
  // Request Form
  'form.newProjectRequest': 'New Project Request',
  'form.fillDetails': 'Fill in the details for your new project request.',
  'form.projectTitle': 'Project Title',
  'form.titlePlaceholder': 'Enter project title',
  'form.description': 'Description',
  'form.descriptionPlaceholder': 'Describe your project request...',
  'form.department': 'Department',
  'form.selectDepartment': 'Select department',
  'form.budget': 'Budget (THB)',
  'form.requesterName': 'Requester Name',
  'form.namePlaceholder': 'Enter your name',
  'form.attachments': 'Attachments',
  'form.dragDrop': 'Drag & drop files here, or',
  'form.browse': 'browse',
  'form.maxSize': 'Maximum file size: 10MB per file',
  'form.cancel': 'Cancel',
  'form.submitRequest': 'Submit Request',
  
  // Departments
  'dept.science': 'Science Department',
  'dept.math': 'Mathematics Department',
  'dept.arts': 'Arts Department',
  'dept.pe': 'Physical Education',
  'dept.library': 'Library',
  'dept.it': 'IT Department',
  'dept.international': 'International Affairs',
  'dept.admin': 'Administration',

  // Auth
  'auth.welcome': 'Welcome',
  'auth.description': 'Sign in to access the project approval system',
  'auth.login': 'Login',
  'auth.signup': 'Sign Up',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.confirmPassword': 'Confirm Password',
  'auth.name': 'Full Name',
  'auth.department': 'Department',
  'auth.forgotPassword': 'Forgot your password?',
  'auth.resetPassword': 'Reset Password',
  'auth.resetDescription': "Enter your email and we'll send you a reset link.",
  'auth.sendResetLink': 'Send Reset Link',
  'auth.enterEmail': 'Please enter your email address',
  'auth.resetEmailSent': 'Password reset link sent! Please check your email.',
  'auth.setNewPassword': 'Set New Password',
  'auth.setNewPasswordDescription': 'Enter your new password below',
  'auth.newPassword': 'New Password',
  'auth.confirmNewPassword': 'Confirm New Password',
  'auth.updatePassword': 'Update Password',
  'auth.passwordsDoNotMatch': 'Passwords do not match',
  'auth.passwordUpdated': 'Password updated successfully!',

  // Admin
  'admin.title': 'Admin Panel',
  'admin.manageRoles': 'Manage User Roles',
  'admin.manageRolesDescription': 'Assign roles to users to control their access and permissions in the system.',
  'admin.searchUsers': 'Search users...',
  'admin.users': 'users',
  'admin.user': 'User',
  'admin.email': 'Email',
  'admin.department': 'Department',
  'admin.currentRole': 'Current Role',
  'admin.changeRole': 'Change Role',
  'admin.you': 'You',
  'admin.noUsers': 'No users found',
  'admin.backToDashboard': 'Back to Dashboard',
  'admin.success': 'Success',
  'admin.error': 'Error',
  'admin.roleUpdated': 'User role has been updated successfully.',
  'admin.fetchError': 'Failed to fetch users. Please try again.',
  'admin.updateError': 'Failed to update role. Please try again.',
  'admin.cannotChangeOwnRole': 'You cannot change your own role.',
  'admin.status': 'Status',
   'admin.disabled': 'Disabled',
   'admin.filterAll': 'All Users',
   'admin.filterActive': 'Active',
   'admin.filterDisabled': 'Disabled',
  'admin.userEnabled': 'User account has been enabled.',
  'admin.userDisabled': 'User account has been disabled.',
  'admin.toggleError': 'Failed to update user status. Please try again.',
  'admin.role.requester': 'Requester',
  'admin.role.reviewer': 'Reviewer',
  'admin.role.approver': 'Approver',
  'admin.role.admin': 'Admin',
  'header.admin': 'Admin',
  'header.adminPanel': 'Admin Panel',
  'admin.activityLog': 'Activity Log',
  'admin.activityLogDescription': 'View all user activities across projects.',
  'admin.searchActivity': 'Search activity...',
  'admin.entries': 'entries',
  'admin.action': 'Action',
  'admin.project': 'Project',
  'admin.performedBy': 'Performed By',
  'admin.role': 'Role',
  'admin.statusChange': 'Status Change',
  'admin.comment': 'Comment',
  'admin.timestamp': 'Timestamp',
  'admin.noActivity': 'No activity found',
  'admin.page': 'Page',
  'admin.from': 'From',
  'admin.to': 'To',
  'admin.chart.totalActivities': 'Total Activities',
  'admin.chart.thisWeek': 'This Week',
  'admin.chart.today': 'Today',
  'admin.chart.activityTrend': 'Activity Trend',
  'admin.chart.activityTrendDesc': 'Daily activity over the last 30 days',
  'admin.chart.actionBreakdown': 'Action Breakdown',
  'admin.chart.roleDistribution': 'Activity by Role',
  'admin.chart.activities': 'Activities',
  'admin.userAccessLog': 'User Access Log',
  'admin.userAccessLogDescription': 'Track user login activity. Records are kept for 90 days.',

  // Delete
  'delete.project': 'Delete Project',
  'delete.projectConfirm': 'Are you sure you want to delete this project? This action cannot be undone.',
  'delete.projectSuccess': 'Project deleted successfully.',
  'delete.projectError': 'Failed to delete project.',
  'delete.user': 'Delete',
  'delete.userConfirm': 'Are you sure you want to delete this user account? This action cannot be undone.',
  'delete.userSuccess': 'User account deleted successfully.',
  'delete.userError': 'Failed to delete user account.',
  'delete.action': 'Actions',

  // Edit & Resubmit
  'edit.editProject': 'Edit Project',
  'edit.resubmit': 'Resubmit',
  'edit.resubmitSuccess': 'Project resubmitted successfully!',
  'edit.resubmitError': 'Failed to resubmit project.',
  'edit.cancelEdit': 'Cancel',

  'profile.title': 'User Profile',
  'profile.description': 'View and edit your profile information.',
  'profile.save': 'Save Changes',
  'profile.updateSuccess': 'Profile updated successfully!',
  'profile.updateError': 'Failed to update profile.',
  'profile.menuItem': 'My Profile',
  'profile.changeAvatar': 'Change Photo',
  'profile.removeAvatar': 'Remove',
  'profile.avatarUpdated': 'Profile photo updated!',
  'profile.avatarRemoved': 'Profile photo removed.',
  'profile.avatarError': 'Failed to update profile photo.',
  'profile.invalidImageType': 'Please select an image file.',
  'profile.imageTooLarge': 'Image must be less than 2MB.',

  // Export
  'export.excel': 'Export Excel',
  'export.bulkExcel': 'Export Selected',
  'export.selectAll': 'Select All',
  'export.deselectAll': 'Deselect All',
  'export.selected': 'selected',
};

// Thai translations
const th: Record<string, string> = {
  // Header
  'header.newRequest': 'คำขอใหม่',
  'header.requester': 'ผู้ร้องขอ',
  'header.reviewer': 'ผู้ตรวจสอบ',
  'header.approver': 'ผู้อนุมัติ',
  'header.requesterView': 'มุมมองผู้ร้องขอ',
  'header.reviewerView': 'มุมมองผู้ตรวจสอบ',
  'header.approverView': 'มุมมองผู้อนุมัติ',
  'header.logout': 'ออกจากระบบ',
  
  // Stats
  'stats.totalProjects': 'โครงการทั้งหมด',
  'stats.underReview': 'กำลังตรวจสอบ',
  'stats.pendingApproval': 'รออนุมัติ',
  'stats.approved': 'อนุมัติแล้ว',
  'stats.rejected': 'ปฏิเสธ',
  
  // Projects
  'projects.title': 'คำขอโครงการ',
  'projects.viewingAs': 'ดูในฐานะ:',
  'projects.all': 'ทั้งหมด',
  'projects.noProjects': 'ไม่พบโครงการในหมวดหมู่นี้',
  'projects.search': 'ค้นหาโครงการ...',
  'projects.files': 'ไฟล์',
  
  // Status
  'status.review': 'กำลังตรวจสอบ',
  'status.pendingApproval': 'รออนุมัติ',
  'status.approved': 'อนุมัติแล้ว',
  'status.rejected': 'ปฏิเสธ',
  
  // Project Detail
  'detail.projectDetails': 'รายละเอียดโครงการ',
  'detail.details': 'รายละเอียด',
  'detail.history': 'ประวัติ',
  'detail.requester': 'ผู้ร้องขอ',
  'detail.department': 'แผนก',
  'detail.budget': 'งบประมาณ',
  'detail.submitted': 'วันที่ส่ง',
  'detail.lastUpdated': 'อัปเดตล่าสุด',
  'detail.description': 'รายละเอียด',
  'detail.attachments': 'ไฟล์แนบ',
  'detail.reviewerComment': 'ความคิดเห็นผู้ตรวจสอบ',
  'detail.approverComment': 'ความคิดเห็นผู้อนุมัติ',
  'detail.noComment': 'ยังไม่มีความคิดเห็น',
  'detail.addComment': 'เพิ่มความคิดเห็น',
  'detail.commentPlaceholder': 'กรอกความคิดเห็นหรือข้อเสนอแนะ...',
  'detail.forward': 'ส่งต่อไปยังผู้อนุมัติ',
  'detail.approve': 'อนุมัติ',
  'detail.reject': 'ปฏิเสธ',
  'detail.close': 'ปิด',
  'detail.comments': 'ความคิดเห็น',
  'detail.downloadError': 'ไม่สามารถดาวน์โหลดไฟล์ได้',
  'detail.noHistory': 'ยังไม่มีประวัติกิจกรรม',
  
  // Audit Log
  'audit.activityHistory': 'ประวัติกิจกรรม',
  'audit.created': 'สร้างโครงการ',
  'audit.submitted': 'ส่งคำขอ',
  'audit.forwarded': 'ส่งต่อไปยังผู้อนุมัติ',
  'audit.approved': 'อนุมัติโครงการ',
  'audit.rejected': 'ปฏิเสธโครงการ',
  'audit.commented': 'เพิ่มความคิดเห็น',
  
  // Request Form
  'form.newProjectRequest': 'คำขอโครงการใหม่',
  'form.fillDetails': 'กรอกรายละเอียดสำหรับคำขอโครงการใหม่ของคุณ',
  'form.projectTitle': 'ชื่อโครงการ',
  'form.titlePlaceholder': 'กรอกชื่อโครงการ',
  'form.description': 'รายละเอียด',
  'form.descriptionPlaceholder': 'อธิบายคำขอโครงการของคุณ...',
  'form.department': 'แผนก',
  'form.selectDepartment': 'เลือกแผนก',
  'form.budget': 'งบประมาณ (บาท)',
  'form.requesterName': 'ชื่อผู้ร้องขอ',
  'form.namePlaceholder': 'กรอกชื่อของคุณ',
  'form.attachments': 'ไฟล์แนบ',
  'form.dragDrop': 'ลากและวางไฟล์ที่นี่ หรือ',
  'form.browse': 'เลือกไฟล์',
  'form.maxSize': 'ขนาดไฟล์สูงสุด: 10MB ต่อไฟล์',
  'form.cancel': 'ยกเลิก',
  'form.submitRequest': 'ส่งคำขอ',
  
  // Departments
  'dept.science': 'กลุ่มสาระวิทยาศาสตร์',
  'dept.math': 'กลุ่มสาระคณิตศาสตร์',
  'dept.arts': 'กลุ่มสาระศิลปะ',
  'dept.pe': 'กลุ่มสาระพลศึกษา',
  'dept.library': 'ห้องสมุด',
  'dept.it': 'ฝ่ายเทคโนโลยีสารสนเทศ',
  'dept.international': 'ฝ่ายวิเทศสัมพันธ์',
  'dept.admin': 'ฝ่ายบริหาร',

  // Auth
  'auth.welcome': 'ยินดีต้อนรับ',
  'auth.description': 'เข้าสู่ระบบเพื่อเข้าถึงระบบอนุมัติโครงการ',
  'auth.login': 'เข้าสู่ระบบ',
  'auth.signup': 'ลงทะเบียน',
  'auth.email': 'อีเมล',
  'auth.password': 'รหัสผ่าน',
  'auth.confirmPassword': 'ยืนยันรหัสผ่าน',
  'auth.name': 'ชื่อ-นามสกุล',
  'auth.department': 'แผนก',
  'auth.forgotPassword': 'ลืมรหัสผ่าน?',
  'auth.resetPassword': 'รีเซ็ตรหัสผ่าน',
  'auth.resetDescription': 'กรอกอีเมลของคุณ แล้วเราจะส่งลิงก์รีเซ็ตให้',
  'auth.sendResetLink': 'ส่งลิงก์รีเซ็ต',
  'auth.enterEmail': 'กรุณากรอกอีเมลของคุณ',
  'auth.resetEmailSent': 'ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว! กรุณาตรวจสอบอีเมลของคุณ',
  'auth.setNewPassword': 'ตั้งรหัสผ่านใหม่',
  'auth.setNewPasswordDescription': 'กรอกรหัสผ่านใหม่ด้านล่าง',
  'auth.newPassword': 'รหัสผ่านใหม่',
  'auth.confirmNewPassword': 'ยืนยันรหัสผ่านใหม่',
  'auth.updatePassword': 'อัปเดตรหัสผ่าน',
  'auth.passwordsDoNotMatch': 'รหัสผ่านไม่ตรงกัน',
  'auth.passwordUpdated': 'อัปเดตรหัสผ่านเรียบร้อยแล้ว!',

  // Admin
  'admin.title': 'แผงควบคุมผู้ดูแลระบบ',
  'admin.manageRoles': 'จัดการบทบาทผู้ใช้',
  'admin.manageRolesDescription': 'กำหนดบทบาทให้ผู้ใช้เพื่อควบคุมการเข้าถึงและสิทธิ์ในระบบ',
  'admin.searchUsers': 'ค้นหาผู้ใช้...',
  'admin.users': 'ผู้ใช้',
  'admin.user': 'ผู้ใช้',
  'admin.email': 'อีเมล',
  'admin.department': 'แผนก',
  'admin.currentRole': 'บทบาทปัจจุบัน',
  'admin.changeRole': 'เปลี่ยนบทบาท',
  'admin.you': 'คุณ',
  'admin.noUsers': 'ไม่พบผู้ใช้',
  'admin.backToDashboard': 'กลับไปแดชบอร์ด',
  'admin.success': 'สำเร็จ',
  'admin.error': 'ข้อผิดพลาด',
  'admin.roleUpdated': 'อัปเดตบทบาทผู้ใช้เรียบร้อยแล้ว',
  'admin.fetchError': 'ไม่สามารถดึงข้อมูลผู้ใช้ได้ กรุณาลองใหม่อีกครั้ง',
  'admin.updateError': 'ไม่สามารถอัปเดตบทบาทได้ กรุณาลองใหม่อีกครั้ง',
  'admin.cannotChangeOwnRole': 'คุณไม่สามารถเปลี่ยนบทบาทของตัวเองได้',
  'admin.status': 'สถานะ',
   'admin.disabled': 'ปิดใช้งาน',
   'admin.filterAll': 'ผู้ใช้ทั้งหมด',
   'admin.filterActive': 'ใช้งานอยู่',
   'admin.filterDisabled': 'ปิดใช้งาน',
  'admin.userEnabled': 'เปิดใช้งานบัญชีผู้ใช้แล้ว',
  'admin.userDisabled': 'ปิดใช้งานบัญชีผู้ใช้แล้ว',
  'admin.toggleError': 'ไม่สามารถอัปเดตสถานะผู้ใช้ได้ กรุณาลองใหม่อีกครั้ง',
  'admin.role.requester': 'ผู้ร้องขอ',
  'admin.role.reviewer': 'ผู้ตรวจสอบ',
  'admin.role.approver': 'ผู้อนุมัติ',
  'admin.role.admin': 'ผู้ดูแลระบบ',
  'header.admin': 'ผู้ดูแลระบบ',
  'header.adminPanel': 'แผงควบคุมผู้ดูแลระบบ',
  'admin.activityLog': 'บันทึกกิจกรรม',
  'admin.activityLogDescription': 'ดูกิจกรรมทั้งหมดของผู้ใช้ในโครงการ',
  'admin.searchActivity': 'ค้นหากิจกรรม...',
  'admin.entries': 'รายการ',
  'admin.action': 'การดำเนินการ',
  'admin.project': 'โครงการ',
  'admin.performedBy': 'ดำเนินการโดย',
  'admin.role': 'บทบาท',
  'admin.statusChange': 'การเปลี่ยนสถานะ',
  'admin.comment': 'ความคิดเห็น',
  'admin.timestamp': 'เวลา',
  'admin.noActivity': 'ไม่พบกิจกรรม',
  'admin.page': 'หน้า',
  'admin.from': 'ตั้งแต่',
  'admin.to': 'ถึง',
  'admin.chart.totalActivities': 'กิจกรรมทั้งหมด',
  'admin.chart.thisWeek': 'สัปดาห์นี้',
  'admin.chart.today': 'วันนี้',
  'admin.chart.activityTrend': 'แนวโน้มกิจกรรม',
  'admin.chart.activityTrendDesc': 'กิจกรรมรายวันในช่วง 30 วันที่ผ่านมา',
  'admin.chart.actionBreakdown': 'สัดส่วนการดำเนินการ',
  'admin.chart.roleDistribution': 'กิจกรรมตามบทบาท',
  'admin.chart.activities': 'กิจกรรม',
  'admin.userAccessLog': 'บันทึกการเข้าถึงผู้ใช้',
  'admin.userAccessLogDescription': 'ติดตามกิจกรรมการเข้าสู่ระบบของผู้ใช้ บันทึกจะถูกเก็บไว้ 90 วัน',

  // Delete
  'delete.project': 'ลบโครงการ',
  'delete.projectConfirm': 'คุณแน่ใจหรือไม่ว่าต้องการลบโครงการนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้',
  'delete.projectSuccess': 'ลบโครงการเรียบร้อยแล้ว',
  'delete.projectError': 'ไม่สามารถลบโครงการได้',
  'delete.user': 'ลบ',
  'delete.userConfirm': 'คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีผู้ใช้นี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้',
  'delete.userSuccess': 'ลบบัญชีผู้ใช้เรียบร้อยแล้ว',
  'delete.userError': 'ไม่สามารถลบบัญชีผู้ใช้ได้',
  'delete.action': 'การดำเนินการ',

  // Edit & Resubmit
  'edit.editProject': 'แก้ไขโครงการ',
  'edit.resubmit': 'ส่งใหม่',
  'edit.resubmitSuccess': 'ส่งโครงการใหม่เรียบร้อยแล้ว!',
  'edit.resubmitError': 'ไม่สามารถส่งโครงการใหม่ได้',
  'edit.cancelEdit': 'ยกเลิก',

  'profile.title': 'โปรไฟล์ผู้ใช้',
  'profile.description': 'ดูและแก้ไขข้อมูลโปรไฟล์ของคุณ',
  'profile.save': 'บันทึกการเปลี่ยนแปลง',
  'profile.updateSuccess': 'อัปเดตโปรไฟล์เรียบร้อยแล้ว!',
  'profile.updateError': 'ไม่สามารถอัปเดตโปรไฟล์ได้',
  'profile.menuItem': 'โปรไฟล์ของฉัน',
  'profile.changeAvatar': 'เปลี่ยนรูปภาพ',
  'profile.removeAvatar': 'ลบ',
  'profile.avatarUpdated': 'อัปเดตรูปโปรไฟล์เรียบร้อยแล้ว!',
  'profile.avatarRemoved': 'ลบรูปโปรไฟล์เรียบร้อยแล้ว',
  'profile.avatarError': 'ไม่สามารถอัปเดตรูปโปรไฟล์ได้',
  'profile.invalidImageType': 'กรุณาเลือกไฟล์รูปภาพ',
  'profile.imageTooLarge': 'รูปภาพต้องมีขนาดน้อยกว่า 2MB',

  // Export
  'export.excel': 'ส่งออก Excel',
  'export.bulkExcel': 'ส่งออกที่เลือก',
  'export.selectAll': 'เลือกทั้งหมด',
  'export.deselectAll': 'ยกเลิกทั้งหมด',
  'export.selected': 'รายการที่เลือก',
};

const translations: Record<Language, Record<string, string>> = { en, th };

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = useCallback((key: string): string => {
    return translations[language][key] || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
