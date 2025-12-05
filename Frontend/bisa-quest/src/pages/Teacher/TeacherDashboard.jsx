import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { teacherService } from "../../services/teacherService";
import AddStudentModal from "../../components/AddStudentModal";
import StudentCard from "../../components/StudentCard";
import Notification from "../../components/Notification";
import Button from "../../components/Button";
import "./styles/TeacherDashboard.css";

const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [statistics, setStatistics] = useState({
    totalStudents: 0,
    activeNow: 0,
    averageProgress: 0,
    needAttention: 0,
  });
  const [topPerformers, setTopPerformers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const result = await teacherService.getDashboardData();
      if (result.success) {
        setStudents(result.data.students || []);
        setStatistics(result.data.statistics || {});
        setTopPerformers(result.data.topPerformers || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (studentData) => {
    const result = await teacherService.createStudent(studentData);
    if (result.success) {
      setShowAddModal(false);
      setSuccessMessage(
        `Student "${studentData.fullname}" added successfully!`
      );
      setShowSuccess(true);
      fetchDashboardData();
    }
    return result;
  };

  const filteredStudents = students.filter((student) =>
    student.fullname?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const studentsPerPage = 4;
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const displayedStudents = filteredStudents.slice(
    (currentPage - 1) * studentsPerPage,
    currentPage * studentsPerPage
  );

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="teacher-dashboard">
      <div className="teacher-dashboard-bg"></div>

      {/* SUCCESS NOTIFICATION */}
      {showSuccess && (
        <Notification
          type="success"
          message={successMessage}
          onClose={() => setShowSuccess(false)}
        />
      )}

      {/* HEADER */}
      <header className="dashboard-header">
        <h1 className="dashboard-title">Teacher Dashboard</h1>

        <div className="teacher-profile">
          <span>{user?.fullname || "Teacher"}</span>
          <div className="profile-avatar"></div>
          <Button
            variant="danger"
            onClick={async () => {
              await logout();
              navigate("/login");
            }}
          >
            Logout
          </Button>
        </div>
      </header>

      <div className="content-wrapper">
        {/* STATS + TOP STUDENTS */}
        <div className="stats-and-top">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{statistics.totalStudents}</div>
              <div className="stat-label">Total Students</div>
            </div>

            <div className="stat-card">
              <div className="stat-value">{statistics.activeNow}</div>
              <div className="stat-label">Active now</div>
            </div>

            <div className="stat-card">
              <div className="stat-value">{statistics.averageProgress}%</div>
              <div className="stat-label">Average Progress</div>
            </div>

            <div className="stat-card">
              <div className="stat-value">{statistics.needAttention}</div>
              <div className="stat-label">Need attention</div>
            </div>
          </div>

          <div className="top-performers-card">
            <h3>Top Performing Students</h3>
            <ol>
              {topPerformers.map((student, index) => (
                <li key={index}>{student.fullname}</li>
              ))}
            </ol>
          </div>
        </div>

        {/* MY STUDENTS SECTION */}
        <div className="students-section">
          <div className="section-header">
            <h2>My Students</h2>

            <div className="section-actions">
              <button
                className="add-student-btn"
                onClick={() => setShowAddModal(true)}
              >
                Add Student
              </button>

              <input
                type="text"
                className="search-input"
                placeholder="Search Student..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="students-grid">
            {displayedStudents.map((student) => (
              <StudentCard key={student.student_id} student={student} />
            ))}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-arrow"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              />

              <span className="page-number">{currentPage}</span>

              <button
                className="page-arrow right"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              />
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {showAddModal && (
        <AddStudentModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddStudent}
        />
      )}
    </div>
  );
};

export default TeacherDashboard;
