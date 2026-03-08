import { Leaf, Upload, BarChart3, GraduationCap, Smartphone, Tractor, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import heroImage from "@/assets/hero-plant.jpg";

const DISEASE_CLASSES = [
  "Apple Scab", "Apple Black Rot", "Apple Cedar Rust", "Apple Healthy",
  "Blueberry Healthy", "Cherry Powdery Mildew", "Cherry Healthy",
  "Corn Cercospora Leaf Spot", "Corn Common Rust", "Corn Northern Leaf Blight", "Corn Healthy",
  "Grape Black Rot", "Grape Esca", "Grape Leaf Blight", "Grape Healthy",
  "Orange Huanglongbing", "Peach Bacterial Spot", "Peach Healthy",
  "Pepper Bacterial Spot", "Pepper Healthy",
  "Potato Early Blight", "Potato Late Blight", "Potato Healthy",
  "Raspberry Healthy", "Soybean Healthy",
  "Squash Powdery Mildew", "Strawberry Leaf Scorch", "Strawberry Healthy",
  "Tomato Bacterial Spot", "Tomato Early Blight", "Tomato Late Blight",
  "Tomato Leaf Mold", "Tomato Septoria Leaf Spot", "Tomato Spider Mites",
  "Tomato Target Spot", "Tomato Yellow Leaf Curl", "Tomato Mosaic Virus", "Tomato Healthy",
];

const SCENARIOS = [
  {
    icon: Tractor,
    title: "Farm Monitoring",
    description: "Real-time crop health management with automated diagnostics.",
  },
  {
    icon: Smartphone,
    title: "Mobile App",
    description: "Snap a photo of a leaf for instant disease identification.",
  },
  {
    icon: GraduationCap,
    title: "Education",
    description: "Interactive learning tools for agricultural training.",
  },
];

const PIPELINE_STEPS = [
  { step: "1", title: "Collect Data", desc: "87K+ annotated leaf images" },
  { step: "2", title: "Preprocess", desc: "Resize, normalize, augment" },
  { step: "3", title: "Transfer Learning", desc: "MobileNetV2 + custom layers" },
  { step: "4", title: "Train & Evaluate", desc: "Validate accuracy on test data" },
  { step: "5", title: "Deploy", desc: "Web/mobile integration" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const Index = () => {
  const [dragOver, setDragOver] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{ disease: string; confidence: number; description: string } | null>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setUploadedImage(dataUrl);
      setResult(null);
      setAnalyzing(true);
      try {
        const resizedBase64 = await resizeImage(dataUrl, 1024);
        const { data, error } = await supabase.functions.invoke("analyze-plant", {
          body: { imageBase64: resizedBase64, mimeType: file.type },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        setResult({
          disease: data.disease || "Unknown",
          confidence: data.confidence ?? 0,
          description: data.description || "",
        });
      } catch (err: any) {
        console.error("Analysis error:", err);
        toast.error(err.message || "Failed to analyze image. Please try again.");
        setResult(null);
      } finally {
        setAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const resizeImage = (dataUrl: string, maxDim: number): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = dataUrl;
    });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto flex items-center justify-between py-4 px-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold text-foreground">PlantCare AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#upload" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Try It</a>
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#architecture" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
            <a href="#diseases" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Diseases</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-28 pb-20 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl lg:text-6xl font-display text-foreground leading-[1.1] mb-5">
                Identify Plant <span className="text-gradient-primary">Diseases</span> Instantly
              </motion.h1>
              <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-lg mb-8">
                Upload a leaf photo for AI-powered disease classification across 38 categories.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
                <a href="#upload" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity shadow-leaf">
                  <Upload className="w-5 h-5" />
                  Try It Now
                </a>
                <a href="#architecture" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-border text-foreground font-semibold hover:bg-secondary transition-colors">
                  How It Works
                  <ArrowRight className="w-5 h-5" />
                </a>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="rounded-2xl overflow-hidden shadow-leaf">
                <img src={heroImage} alt="Healthy green plant leaves" className="w-full h-[400px] object-cover" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Upload */}
      <section id="upload" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-10">
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-display text-foreground mb-3">Try Disease Detection</motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground">Upload a plant leaf image for AI analysis.</motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="max-w-xl mx-auto">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`rounded-2xl border-2 border-dashed transition-all duration-300 ${
                dragOver ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/50"
              } ${uploadedImage ? "p-6" : "p-12"}`}
            >
              {!uploadedImage ? (
                <div className="text-center">
                  <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <p className="text-foreground font-semibold mb-1">Drag & drop a leaf image</p>
                  <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
                  <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium cursor-pointer hover:opacity-90 transition-opacity text-sm">
                    <Upload className="w-4 h-4" />
                    Choose File
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFile(file);
                    }} />
                  </label>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-6 items-center">
                  <div className="w-40 h-40 rounded-xl overflow-hidden flex-shrink-0 border border-border">
                    <img src={uploadedImage} alt="Uploaded leaf" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    {analyzing ? (
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          <span className="text-foreground font-semibold">Analyzing...</span>
                        </div>
                        <p className="text-sm text-muted-foreground">AI is examining the leaf image</p>
                      </div>
                    ) : result ? (
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-2">
                          <BarChart3 className="w-3.5 h-3.5" />
                          Analysis Complete
                        </div>
                        <h3 className="text-xl font-display text-foreground mb-1">{result.disease}</h3>
                        <p className="text-sm text-muted-foreground mb-1">Confidence: {result.confidence.toFixed(1)}%</p>
                        {result.description && (
                          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{result.description}</p>
                        )}
                        <div className="w-full bg-secondary rounded-full h-2 mb-3">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${result.confidence}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-2 rounded-full bg-primary"
                          />
                        </div>
                        <button
                          onClick={() => { setUploadedImage(null); setResult(null); }}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          Upload another image →
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-3">
              Results are indicative — consult an expert for confirmed diagnosis.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gradient-section">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-12">
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-display text-foreground mb-3">Use Cases</motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {SCENARIOS.map((s) => (
              <motion.div key={s.title} variants={fadeUp}
                className="group p-6 rounded-xl bg-card border border-border hover:shadow-card-hover transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <s.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-display text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Architecture */}
      <section id="architecture" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-12">
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-display text-foreground mb-3">How It Works</motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            {PIPELINE_STEPS.map((step) => (
              <motion.div key={step.step} variants={fadeUp}
                className="flex items-center gap-3 px-5 py-3 rounded-xl bg-card border border-border"
              >
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-display font-bold text-sm flex-shrink-0">
                  {step.step}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Disease Classes */}
      <section id="diseases" className="py-20 bg-gradient-section">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-12">
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-display text-foreground mb-3">38 Supported Diseases</motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground">Covering Apple, Corn, Grape, Potato, Tomato, and more.</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-w-5xl mx-auto"
          >
            {DISEASE_CLASSES.map((d) => {
              const isHealthy = d.includes("Healthy");
              return (
                <motion.div key={d} variants={fadeUp}
                  className={`px-3 py-2 rounded-lg text-xs font-medium text-center border ${
                    isHealthy
                      ? "bg-primary/10 border-primary/20 text-primary"
                      : "bg-card border-border text-foreground"
                  }`}
                >
                  {d}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <Leaf className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">PlantCare AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
