interface ProgressBarProps {
  progress: number;
}

function ProgressBar(props: ProgressBarProps) {
  const ProgressBarStyles = {
    width: `${props.progress}%`,
  };

  return (
    <div className="h-3 rounded-xl bg-zinc-700 w-full mt-4">
      <div
        role="progressbar"
        aria-label="Progresso do hábito"
        aria-valuenow={props.progress}
        className="h-3 rounded-xl bg-violet-600 transition-all"
        style={ProgressBarStyles}
      />
    </div>
  );
}

export default ProgressBar;
