import FadeIn from '../components/UI/FadeIn';
import BorderBox from '../components/UI/BorderBox';

const EntryDetail = () => {
  return (
    <FadeIn>
      <div className="pt-32 px-8 md:px-0 max-w-3xl mx-auto pb-32">
        <div className="mb-12 text-center">
          <p className="font-sans text-[9px] uppercase tracking-[0.4em] text-ink/40 mb-4">Archive Entry 001</p>
          <h1 className="font-serif text-5xl text-ink">Line & Drape</h1>
        </div>

        {/* The Hero Sketch using the BorderBox */}
        <BorderBox className="mb-16 aspect-[4/5] w-full max-w-lg mx-auto">
          <span className="font-sans text-[10px] tracking-[0.3em] text-ink/30">
            [ SKETCH RENDER: THE ASYMMETRIC COLUMN ]
          </span>
        </BorderBox>

        {/* The Essay */}
        <div className="prose prose-p:font-sans prose-p:text-[13px] prose-p:leading-[2em] prose-p:text-ink/80 text-justify max-w-[600px] mx-auto">
          <p className="mb-8">
            A study in controlled volume and asymmetric shadow. We do not design for the moment; we design for the movement. Every fold is intentional. Every silence is earned.
          </p>
          <p className="mb-8">
            The foundation of Entry 001 lies in the tension between structure and fluidity. The tailored waistband anchors the garment to the architecture of the body, while the heavy silk crepe falls away in a deliberate, pooling drape. This is modesty engineered as power.
          </p>
          
          <div className="my-16 py-8 border-y-[0.5px] border-ink/10 text-center">
            <p className="font-sans text-[9px] uppercase tracking-[0.3em] text-ink/50 mb-2">Primary Material</p>
            <p className="font-serif text-xl">Heavy Silk Crepe</p>
          </div>
        </div>
      </div>
    </FadeIn>
  );
};

export default EntryDetail;