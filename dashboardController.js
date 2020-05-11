var tblHrmEmployeeDetails = require("../models/tbl_hrm_employee_details")
var tblHrmLeavesTypes = require("../models/tbl_hrm_leave_types")
var tblHrmEmployeesLeaves = require("../models/tbl_hrm_employee_leaves")
var tblHrmEmployeesLeaveTrack = require("../models/tbl_hrm_employee_leave_track")
var tblHrmCityPublicHoliday = require("../models/tbl_hrm_city_public_holidays")
const sequelize = require("../common/dbconfig").sequelize;
const Sequelize = require("sequelize");

// opposite sequelize
const Op = Sequelize.Op;
// passing sequelize object
tblHrmEmployeeDetails = tblHrmEmployeeDetails(sequelize, Sequelize);
tblHrmLeavesTypes = tblHrmLeavesTypes(sequelize, Sequelize);
tblHrmEmployeesLeaves = tblHrmEmployeesLeaves(sequelize, Sequelize);
tblHrmEmployeesLeaveTrack = tblHrmEmployeesLeaveTrack(sequelize, Sequelize);
tblHrmCityPublicHoliday = tblHrmCityPublicHoliday(sequelize, Sequelize);

exports.dashboardUserDetails = async (req, res, next) => {
  try{
    empId = req.body.id
  }
  catch(error){
    console.log(err)
  }
  var output = {}
  try {
    output['employeeDetails'] = await getEmployeeDetails(empId)
    if (output['employeeDetails'].length > 0) {
      output['totalLeaves'] = await getTotalLeaves(empId);
      output['leaveDetails'] = await getEmployeeActiveLeave(empId);
      output['publicHolidays'] = await getPublicHolidays(empId);
      output['birthdayHoliday'] = await birthdayHoliday(empId)
      var applyLeaveArr = {};
      var employeeDetails = output['employeeDetails'];
      var leaveTypes = {}
      var leaveShortArr = {}
      var leaveColorArr = {}
      var leaveCalendarArr = {}
      var publicHolidaysArr = {}
      for (var i of output['leaveDetails']) {
        leaveTypes[i['id']] = i['leave_name'];
        leaveShortArr[i['id']] = i['short_code'];
        leaveColorArr[i['id']] = i['color_code'];
        leaveCalendarArr[i['id']] = i['calendar_codes'];
        if (i['apply_leave'] == 1) {
          if (i['id'] == '14') {// for paternity leave
            if (employeeDetails[0]['gender'] == '1' && employeeDetails[0]['marital_status'] == '1') { // only for married men
              applyLeaveArr[i['id']] = i['id'];
            }
          }
          else if (i['id'] == '13') { // for maternity leave
            if (employeeDetails[0]['gender'] == '2' && employeeDetails[0]['marital_status'] == '1') { // only for married women
              applyLeaveArr[i['id']] = i['id'];
            }
          } else if (i['id'] == '12') { // marriage leave
            if (employeeDetails[0]['matrital_status'] == 2) { // only for singles
              applyLeaveArr[i['id']] = i['id'];
            }
          }
          else {
            applyLeaveArr[i['id']] = i['id'];
            delete applyLeaveArr['4']; // comp off
          }
        }
      }
    }
    output['applyLeave'] = applyLeaveArr;

    // Todo : will work at last

    // output['leaveHistory'] = await getLeaveTrack(empId, leaveShortArr, leaveCalendarArr, leaveColorArr);
    // output['publicHolidays'] = await getPublicHolidays(empId, output['employeeDetails'][0]['city_id']);
    //                          $date1 = date('m-d', strtotime($empDetailsArr[0]['date_of_birth']));
    //                          $bdate = '';
    //                 for ($i = 0; $i < 4; $i++) {    
    //                     $years = '' . +$i . ' Year';
    //                     $bdate = date('Y', strtotime($years)) . "-" . $date1;
    //                     //  $bdate = date('Y') . "-" . $date1;   
    //                     //Adding Birthday Leaves
    //                     $leaveHistory[] = array(
    //                         'title'       => $leaveShortArr[6],
    //                         'description' => "Birthday Leave",
    //                         'start'       => $bdate,
    //                         'className'   => $leaveCalendarArr[6] . ' ' . $leaveColorArr[6]
    //                     );
    //                 }


    //                 $dutyHours = array();
    //                 if ($empDetailsArr[0]['last_attendance_calculated'] != 0) {
    // //                    $toDate = date('Y-m-d', strtotime($empDetailsArr[0]['last_attendance_calculated']));
    // //                    $fromDate = date('Y-m-d', strtotime($toDate . '-30 days'));
    // $fromDate =  date('Y/m/01');
    // $toDate  = date('Y-m-d');
    //                     if ($fromDate <= date('Y-m-d', strtotime($empDetailsArr[0]['date_of_joining']))) {
    //                         $fromDate = date('Y-m-d', strtotime($empDetailsArr[0]['date_of_joining']));
    //                     }

    //                     $totalDutyHours = $totalDays = $averageDutyTime = 0;
    //                     $whereAttendance = 'active = 1 AND date BETWEEN "' . $fromDate . '" AND "' . $toDate . '" AND emp_id = "' . $emp_id . '"';                   
    //                     $attendanceArr = $this->_attendanceDaily->selectData(array('id', 'emp_id', 'date', 'attendance_type', 'absent_type', 'checkin_time', 'checkout_time'), $whereAttendance);
    //                     foreach ($attendanceArr as $attendVal) {
    //                         if (($attendVal['attendance_type'] == 1) || ($attendVal['attendance_type'] == 3)) {
    //                             $dutyTimeInMins = round((strtotime($attendVal['checkout_time']) - strtotime($attendVal['checkin_time'])) / (60));
    //                             $dutyHours[date('d-M', strtotime($attendVal['date']))] = date('H.i', mktime(0,$dutyTimeInMins));
    //                             $totalDutyHours = $totalDutyHours + $dutyTimeInMins;
    //                             if ($attendVal['attendance_type'] == 1) {
    //                                 $dayCount = 1;
    //                             } else {
    //                                 $dayCount = 0.5;
    //                             }
    //                             $totalDays = $totalDays + $dayCount;
    //                         } else {
    //                             $dutyHours[date('d-M', strtotime($attendVal['date']))] = '0.0';
    //                         }
    //                     }
    //                     if ($totalDutyHours > 0 && $totalDays > 0) {
    //                         if ($totalDays > 1) {
    //                             $avergTime       = ($totalDutyHours/$totalDays); 
    //                             $averageDutyTime = date('H:i', mktime(0,$avergTime));
    //                         } else {
    //                             $averageDutyTime = date('H:i', mktime(0,$totalDutyHours));
    //                         }
    //                     }
    //                 }
    //                 if($averageDutyTime != 0){
    //                     $averageDutyTime = $averageDutyTime.' hrs';
    //                 }else{
    //                     $averageDutyTime = $averageDutyTime.' hr';
    //                 }
    await output['totalLeaves'];
  }
  catch (error) {
    console.log(error)
  }
  res.json(output);
}

async function getEmployeeDetails(empId) {
  return await tblHrmEmployeeDetails.findAll({
    attributes: ['id', 'employee_firstname', 'employee_middlename', 'employee_lastname', 'grab_id', 'city_id', 'designation_id', 'department_id', 'gender', 'marital_status', 'profile_photo', 'date_of_birth', 'date_of_joining', 'date_of_permanent', 'expected_date_of_permanent', 'last_attendance_calculated'],
    where: {
      id: empId
    },
    raw: true
  })
}

async function getEmployeeActiveLeave(empId) {
  return await tblHrmLeavesTypes.findAll({
    attributes: ['id', 'leave_name', 'short_code', 'color_code', 'calendar_codes', 'apply_leave'],
    where: {
      active: 1
    },
    raw: true
  })
}

async function getLeaveTrack(empId, leaveShortArr, leaveCalendarArr, leaveColorArr) {
  var output = [];
  var leaveTrackArr = await tblHrmEmployeesLeaveTrack.findAll({
    attributes: ['attendance_type', 'emp_id', 'leave_type', 'leave_date', 'leave_reason', 'leave_status'],
    where: {
      id: empId,
      leave_status: [1, 2],
      leave_status: { [Op.notIn]: [3, 6] },
    },
    raw: true
  })
  if (leaveTrackArr.length > 0) {
    for (var leaveVal of leaveTrackArr) {
      var title, status = '';
      if (leaveVal['attendence_type'] == 2) {
        title = 'H';
      }
      if (leaveVal['leave_status'] == 1) {
        status = '(Pending)';
      }
      output.push({
        'title': title + leaveShortArr[leaveVal['leave_type']],
        'description': status + leaveVal['leave_reason'].charAt(0).toUpperCase() + leaveVal['leave_reason'].slice(1),
        'start': leaveVal['leave_date'],
        'className': leaveCalendarArr[leaveVal['leave_type']] + ' ' + leaveColorArr[leaveVal['leave_type']]
      })
    }
  }
  return output
}

async function getTotalLeaves(empId) {
  var leaveArrOutput = {};
  var totalLeaves = 0;
  var usedLeaves = 0;
  var pendingLeaves = 0;

  // get data from model
  var leaveArr = await tblHrmEmployeesLeaves.findAll({
    attributes: ['id', 'emp_id', 'leave_type', 'lapsed_leaves', 'total_leaves', 'temp_used_leaves', 'temp_pending_leaves'],
    where: {
      id: empId,
      active: 1,
      leave_year: new Date().getFullYear()
    },
    raw: true
  })
  // data formating
  for (var leaveVal of leaveArr) {
    var leaveFlag = true;
    console.log([7, 10, 12, 13, 14].includes(parseInt(leaveVal['leave_type'])));
    if ([7, 10, 12, 13, 14].includes(parseInt(leaveVal['leave_type']))) {
      if (leaveVal['total_leaves'] == 0) {
        leaveFlag = false;
      }
    }
    if (leaveFlag) {
      var percentage = '0%';
      if (leaveVal['temp_pending_leaves'] > 0 && leaveVal['total_leaves'] > 0) {
        percentage = ((leaveVal['temp_pending_leaves'] / leaveVal['total_leaves']) * 100).toString() + '%';
      }
      leaveArrOutput[leaveVal['leave_type']] = {
        total_leaves: leaveVal['total_leaves'],
        used_leaves: leaveVal['temp_used_leaves'],
        pending_leaves: leaveVal['temp_pending_leaves'],
        total_leaves: leaveVal['total_leaves'],
        balance_percent: percentage,
        lapsed_leaves: leaveVal['lapsed_leaves']
      }
      totalLeaves = totalLeaves + leaveVal['total_leaves'];
      usedLeaves = usedLeaves + leaveVal['temp_used_leaves'];
      pendingLeaves = pendingLeaves + leaveVal['temp_pending_leaves'];
    }
  }
  var output = {
    leave_types: leaveArrOutput,
    totalLeaves: totalLeaves,
    usedLeaves: usedLeaves,
    pendingLeaves: pendingLeaves
  }
  return output
}

async function getPublicHolidays(empId) {
  var output = []
  // get data from model
  var emp = await tblHrmEmployeeDetails.findAll({where:{id:empId}});
  cityId = emp[0]['city_id'];
  var publicHolidaysArr = await tblHrmCityPublicHoliday.findAll({
    attributes: ['date', 'holiday'],
    where: {
      city_id: cityId
    },
    raw: true
  })
  return publicHolidaysArr;
// foreach($publicholidayArr as $publicholidayArrs){
//         $leaveHistory[] = array(      
//               'title'        => "PH",
//               'description'  => $publicholidayArrs['holiday'],
//               'start'        => $publicholidayArrs['date'],
//               'className'    => "m-fc-event--focus" . ' ' . "bg-focus"
//           );

  // } 
  
  
}

async function birthdayHoliday(empId){
  emp=await tblHrmEmployeeDetails.findAll(
    {
      where:
      {
        id:empId
      }
    });
    dateOfBirth=String(emp[0]["date_of_birth"])
    oldYr=dateOfBirth.slice(11,15)
    newYr=new Date().getFullYear()
    dateOfBirth= dateOfBirth.replace(oldYr,newYr);
    console.log(dateOfBirth)
    return dateOfBirth

}


