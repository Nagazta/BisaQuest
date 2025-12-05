const StudentIcon = ({ size = 20 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Kid/Student with backpack */}
      <circle cx="12" cy="6" r="3" />
      <path d="M12 10C8.5 10 6 12 6 14V16C6 17 6.5 18 8 18H16C17.5 18 18 17 18 16V14C18 12 15.5 10 12 10Z" />
      {/* Backpack straps */}
      <path
        d="M9 11L8 15"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M15 11L16 15"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default StudentIcon;
