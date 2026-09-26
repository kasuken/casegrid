const cells = Array.from({ length: 16 }, (_, index) => index)

export function CaseGridMark() {
  return (
    <div className="case-grid-mark" aria-hidden="true">
      {cells.map((cell) => (
        <span
          className={
            cell === 5
              ? 'case-grid-mark__cell case-grid-mark__cell--victim'
              : cell === 10
                ? 'case-grid-mark__cell case-grid-mark__cell--suspect'
                : 'case-grid-mark__cell'
          }
          key={cell}
        />
      ))}
    </div>
  )
}
