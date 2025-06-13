export function Links() {
  return (
    <div style={{ minWidth: 500 }}>
      <h1>Links</h1>
      <ul>
        {[
          {
            label: "Seeding and Schedule",
            href: "https://docs.google.com/spreadsheets/d/1WPiOSlhUMA0Ekwf1E5tkmo2hBt3uhp6Z-qRXkDbSj0I/edit?gid=1285848611",
          },
          {
            label: "Match Results (Waves)",
            href: "https://docs.google.com/spreadsheets/d/1bBmSzHpBUQXdCXUJGADTOLjV9AwkztwRm-imC2a2x7s/edit?gid=1574773341",
          },
          {
            label: "Commentary Schedule",
            href: "https://docs.google.com/spreadsheets/d/1npUlsT_tOpiWWOP5Y39M9RWsrMkgv-NL97Ydm3kosSc/edit?usp=sharing",
          },
          {
            label: "start.gg (ITGmania)",
            href: "https://www.start.gg/tournament/ceo-2025-6/event/itgmania",
          },
          {
            label: "Ruleset",
            href: "https://docs.google.com/document/u/3/d/e/2PACX-1vS0H4OPY04YEHTq7Mx6pNA2N_FZtf5QWywYCL-a9j-nFR-Ed6W9XISgS3KaDb1ztGIbO6yCXyMHodtT/pub",
          },
          {
            label: "Shared Google Drive",
            href: "https://drive.google.com/drive/u/3/folders/19GVfw6pU-Pp_v4SxzOBULeIS8FN4a4Je",
          },
          {
            label: "Project Storm Homepage",
            href: "https://project-storm.com/",
          },
        ].map((link, linkIndex) => (
          <li key={linkIndex}>
            <a href={link.href} target="_blank" rel="noopener noreferrer">
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
