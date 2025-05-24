
interface PostSwiperCounterProps {
  currentIndex: number;
  totalCount: number;
}

export const PostSwiperCounter = ({ currentIndex, totalCount }: PostSwiperCounterProps) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 text-center text-xs text-muted-foreground mb-2">
      {currentIndex + 1} of {totalCount}
    </div>
  );
};
