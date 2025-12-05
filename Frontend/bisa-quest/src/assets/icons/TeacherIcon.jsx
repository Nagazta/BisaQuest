const TeacherIcon = ({ size = 20 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Adult/Teacher with glasses */}
      <circle cx="12" cy="5.5" r="3" />
      {/* Glasses */}
      <circle
        cx="10"
        cy="5.5"
        r="1.2"
        fill="none"
        stroke="white"
        strokeWidth="1"
      />
      <circle
        cx="14"
        cy="5.5"
        r="1.2"
        fill="none"
        stroke="white"
        strokeWidth="1"
      />
      <line
        x1="11.2"
        y1="5.5"
        x2="12.8"
        y2="5.5"
        stroke="white"
        strokeWidth="1"
      />
      {/* Body */}
      <path d="M12 9.5C8 9.5 5.5 11.5 5.5 14V17C5.5 18.5 6.5 19 8 19H16C17.5 19 18.5 18.5 18.5 17V14C18.5 11.5 16 9.5 12 9.5Z" />
      {/* Tie/professional touch */}
      <path d="M12 10L11 14L12 18L13 14L12 10Z" fill="white" opacity="0.7" />
    </svg>
  );
};

export default TeacherIcon;
