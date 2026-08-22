// "use client";

// import { useEffect, useState } from "react";

// type View = "grid" | "list";

// const ProjectsViewToggle = () => {
//   const [view, setView] = useState<View>("grid");

//   useEffect(() => {
//     const savedView = localStorage.getItem("project-view");

//     if (savedView === "grid" || savedView === "list") {
//       setView(savedView);
//     }
//   }, []);

//   const handleView = (newView: View) => {
//     setView(newView);
//     localStorage.setItem("project-view", newView);
//   };

//   return (
//     <div>
//       <button className="btn" onClick={() => handleView("grid")}>
//         Grid
//       </button>

//       <button className="btn" onClick={() => handleView("list")}>
//         List
//       </button>

//       <p>Current view: {view}</p>
//     </div>
//   );
// };

// export default ProjectsViewToggle;