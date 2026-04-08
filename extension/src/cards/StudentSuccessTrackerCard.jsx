import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

import { useCardInfo, useData } from "@ellucian/experience-extension-utils";

import useFetch from "../hooks/useFetch.js";

import { withStyles } from "@ellucian/react-design-system/core/styles";
import { Typography } from "@ellucian/react-design-system/core";

import SvgHollowCircle from "../components/SvgHollowCircle.jsx";

const styles = (theme) => ({
  card: {
    padding: "0 0.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    overflow: "hidden",
    width: "100%",
    height: "100%",
    boxSizing: "border-box",
  },
  cardBody: {
    flex: 1,
    display: "flex",
    flexDirection: "row",
    overflow: "hidden",
    [theme.breakpoints.down("md")]: {
      flexDirection: "column",
    },
  },
  gpaSection: {
    flex: "0 0 38%",
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    overflow: "hidden",
  },
  attendanceSection: {
    flex: "1 1 62%",
    minWidth: 0,
    paddingLeft: "0.5rem",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  metricBlock: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1.2rem",
    width: "100%",
  },
  circleContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  circleInner: {
    width: "4.5rem",
    height: "4.5rem",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  circleValue: {
    fontSize: "1.1rem",
    fontWeight: 600,
    lineHeight: 1,
  },
  metricFooter: {
    height: "1.2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  subLabel: {
    display: "flex",
    alignItems: "center",
    gap: "3px",
    fontSize: "0.62rem",
    whiteSpace: "nowrap",
  },
  circleDivider: {
    width: "70%",
    margin: "0",
  },
  attendanceHeader: {
    marginBottom: "0.1rem",
  },
  iconText: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  attendanceList: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    padding: "0 0.25rem",
  },
  attendanceRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.2rem 0.25rem",
    borderBottom: "1px solid #e0e0e0",
    gap: "0.25rem",
    minHeight: "0",
    flex: 1,
    "&:last-child": {
      borderBottom: "none",
    },
  },
  courseName: {
    flex: 1,
    fontSize: "0.68rem",
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    lineHeight: "1.2",
  },
  attendancePercentage: {
    display: "flex",
    alignItems: "center",
    gap: "0.3rem",
    fontSize: "0.68rem",
    fontWeight: 400,
    flexShrink: 0,
  },
});

/* ================= HELPERS ================= */
const getStatusColor = (value) => {
  if (value === null || value === undefined) return "#999";
  if (value >= TABLE_CONFIG.attendanceGood) return COLOR_CONFIG.ON_TRACK;
  if (value >= TABLE_CONFIG.attendanceWarning) return COLOR_CONFIG.NEEDS_ATTENTION;
  return COLOR_CONFIG.CRITICAL;
};

const get_performance_color = (performance_metric, minimum_threshold_for_excellent_performance, minimum_threshold_for_satisfactory_performance, excellent_performance_color_code, satisfactory_performance_color_code, poor_performance_color_code) => {
  if (performance >= minimum_threshold_for_excellent_performance){
    return excellent_performance_color_code;
  } else if(performance <= minimum_threshold_for_satisfactory_performance){
    return satisfactory_performance_color_code;
  } else {
    return poor_performance_color_code;
  }
};

/* ================= COMPONENT ================= */
const StudentSuccessTracker = ({ classes }) => {
  const { authenticatedEthosFetch } = useData();

  const { cardId, cardConfiguration } = useCardInfo();
  const { excellent_performance_color_code, satisfactory_performance_color_code, poor_performance_color_code, minimum_threshold_for_excellent_performance, minimum_threshold_for_satisfactory_performance, minimum_threshold_for_excellent_attendance, minimum_threshold_for_satisfactory_attendance, latest_term_information_pipeline } = cardConfiguration;

  if (minimum_threshold_for_excellent_performance <= minimum_threshold_for_satisfactory_performance){
    throw new Error("Invalid performance configuration")
  }

  if (minimum_threshold_for_excellent_attendance <= minimum_threshold_for_satisfactory_attendance){
    throw new Error("Invalid attendance performance configuration")
  }

  // Helper functions
    const get_gpa_color = (gpa) => {
    if (gpa >= minimum_threshold_for_excellent_performance){
      return excellent_performance_color_code;
    } else if(gpa <= minimum_threshold_for_satisfactory_performance){
      return satisfactory_performance_color_code;
    } else {
      return poor_performance_color_code;
    }
  };

  const get_attendance_color = (attendance) => {
    if (attendance >= minimum_threshold_for_excellent_attendance){
      return excellent_performance_color_code;
    } else if (attendance >= minimum_threshold_for_satisfactory_attendance){
      return satisfactory_performance_color_code;
    } else {
      return poor_performance_color_code;
    }
  }

  const [currentGpa, setCurrentGpa]       = useState(0);
  const [termName, setTermName]           = useState("");
  const [attendanceData, setAttendanceData] = useState([]);
  const [avgAttendance, setAvgAttendance] = useState(null);

  // ── Fetch latest term info ───────────────────────────────────────────────
  const { data, loading } = useFetch(
    authenticatedEthosFetch,
    cardId,
    null,
    latest_term_information_pipeline,
    {},
  );

  // ── React to data ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!data) return;

    setCurrentGpa(parseFloat(data.cumulativeGpa) || 0);
    setTermName(data.termName || "");
    setAttendanceData(Array.isArray(data.termInformation) ? data.termInformation : []);
    setAvgAttendance(data.averageAttendancePercentage ?? null);
  }, [data]);

  const gpa_circle_color = get_gpa_color(gpa);
  const attendance_circle_color = get_attendance_color(avgAttendance);

  return (
    <div className={classes.card}>
      <div className={classes.cardBody}>

        {/* ── Left: GPA + Attendance circles ── */}
        <section className={classes.gpaSection}>

          <div className={classes.metricBlock}>
            <Typography variant="h5">Cumulative GPA</Typography>
            <div className={classes.circleContainer}>
              <div
                className={classes.circleInner}
                style={{ border: `4px solid ${gpaCircleColor}` }}
              >
                <strong className={classes.circleValue} style={{ color: gpaCircleColor }}>
                  {loading ? "..." : currentGpa.toFixed(2)}
                </strong>
              </div>
            </div>
          </div>

          <div className={classes.circleDivider} />

          <div className={classes.metricBlock}>
            <Typography variant="h5">Term Attendance</Typography>
            <div className={classes.circleContainer}>
              <div
                className={classes.circleInner}
                style={{ border: `4px solid ${attendanceCircleColor}` }}
              >
                <strong className={classes.circleValue} style={{ color: attendanceCircleColor }}>
                  {loading ? "..." : avgAttendance != null ? `${avgAttendance}%` : "N/A"}
                </strong>
              </div>
            </div>
          </div>

        </section>

        {/* ── Right: per-course attendance list ── */}
        <section className={classes.attendanceSection}>
          <header className={classes.attendanceHeader}>
            <Typography variant="h5" style={{ textAlign: "center" }}>
              Attendance Overview
            </Typography>
            <Typography variant="body2" style={{ textAlign: "center" }}>
              {termName || "Current Term"}
            </Typography>
          </header>

          {loading ? (
            <Typography style={{ textAlign: "center", padding: "1rem" }}>
              Loading attendance data...
            </Typography>
          ) : attendanceData.length === 0 ? (
            <Typography style={{ textAlign: "center", padding: "1rem" }}>
              No attendance data available
            </Typography>
          ) : (
            <div className={classes.attendanceList}>
              {attendanceData.map((at, index) => {
                const percentage        = at.attendancePercentage ?? 0;
                const displayPercentage = at.attendancePercentage !== null ? `${percentage}%` : "N/A";
                return (
                  <div key={index} className={classes.attendanceRow}>
                    <div className={classes.courseName} title={at.courseTitle}>
                      {at.courseTitle}
                    </div>
                    <div className={classes.attendancePercentage}>
                      <span>{displayPercentage}</span>
                      <SvgHollowCircle color={getStatusColor(at.attendancePercentage)} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

StudentSuccessTracker.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(StudentSuccessTracker);