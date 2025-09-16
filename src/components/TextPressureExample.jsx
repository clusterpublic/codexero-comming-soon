import TextPressure from './three/TextPressure';

const TextPressureExample = () => {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-900">
      <div className="w-full max-w-4xl h-96">
        <TextPressure
          text="CodeXero is Coming"
          fontFamily="Kalipixel"
          fontUrl="/src/fonts/kalipixel/Kalipixel.ttf"
          textColor="#FFFFFF"
          strokeColor="#FF6B6B"
          strokeWidth={2}
          stroke={true}
          width={true}
          weight={true}
          italic={true}
          alpha={false}
          useVariableFont={false} // Force fallback effects for Kalipixel
          fallbackEffects={true} // Enable enhanced effects
          minFontSize={32}
          className="text-center"
        />
      </div>
    </div>
  );
};

export default TextPressureExample;

