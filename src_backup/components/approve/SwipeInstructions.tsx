
interface SwipeInstructionsProps {
  show: boolean;
}

export const SwipeInstructions = ({ show }: SwipeInstructionsProps) => {
  if (!show) return null;
  
  return (
    <div className="text-center mt-6 text-sm text-muted-foreground animate-fade-in">
      <p className="font-medium">👆 Swipe right to approve, left to reject 👆</p>
      <p>Or use the buttons below the post</p>
    </div>
  );
};
