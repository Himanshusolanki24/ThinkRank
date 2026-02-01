import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import {
    GraduationCap,
    Phone,
    Link as LinkIcon,
    Sparkles,
    ArrowRight,
    ArrowLeft,
    Check,
    User,
    BookOpen,
    Code,
    Building,
    Calendar,
    FileText,
    Linkedin,
    Github,
    X,
    Loader2,
    AtSign,
    Camera,
    Upload,
} from "lucide-react";

const ACADEMIC_YEARS = [
    "1st Year",
    "2nd Year",
    "3rd Year",
    "4th Year",
    "5th Year",
    "Graduate",
    "Post Graduate",
    "Working Professional",
];

const COURSES = [
    "B.Tech",
    "B.E.",
    "BCA",
    "B.Sc Computer Science",
    "B.Sc IT",
    "MCA",
    "M.Tech",
    "M.Sc Computer Science",
    "MBA",
    "Other",
];

const SPECIALIZATIONS = [
    "Computer Science",
    "Information Technology",
    "Artificial Intelligence",
    "Machine Learning",
    "Data Science",
    "Cyber Security",
    "Cloud Computing",
    "Full Stack Development",
    "Mobile Development",
    "DevOps",
    "Other",
];

const SKILL_SUGGESTIONS = [
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "Python",
    "Java",
    "C++",
    "HTML/CSS",
    "SQL",
    "MongoDB",
    "Git",
    "Docker",
    "AWS",
    "Machine Learning",
    "Data Analysis",
    "UI/UX Design",
    "Figma",
    "REST APIs",
    "GraphQL",
    "Next.js",
];

interface FormData {
    username: string;
    instituteName: string;
    whatsappNumber: string;
    academicYear: string;
    course: string;
    specialization: string;
    shortBio: string;
    skills: string[];
    linkedinUrl: string;
    githubUsername: string;
}

const CompleteProfile = () => {
    const navigate = useNavigate();
    const { user, profile, refreshProfile } = useAuth();
    const { toast } = useToast();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [skillInput, setSkillInput] = useState("");
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

    const [formData, setFormData] = useState<FormData>({
        username: "",
        instituteName: "",
        whatsappNumber: "",
        academicYear: "",
        course: "",
        specialization: "",
        shortBio: "",
        skills: [],
        linkedinUrl: "",
        githubUsername: "",
    });

    // Pre-fill form data if editing
    useEffect(() => {
        if (profile) {
            setFormData({
                username: profile.username || "",
                instituteName: profile.institute_name || "",
                whatsappNumber: profile.whatsapp_number || "",
                academicYear: profile.academic_year || "",
                course: profile.course || "",
                specialization: profile.specialization || "",
                shortBio: profile.short_bio || "",
                skills: profile.skills || [],
                linkedinUrl: profile.linkedin_url || "",
                githubUsername: profile.github_username || "",
            });
            if (profile.avatar_url) {
                setAvatarPreview(profile.avatar_url);
            }
        }
    }, [profile]);

    const totalSteps = 3;

    const updateFormData = (field: keyof FormData, value: string | string[]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const addSkill = (skill: string) => {
        const trimmedSkill = skill.trim();
        if (trimmedSkill && !formData.skills.includes(trimmedSkill)) {
            updateFormData("skills", [...formData.skills, trimmedSkill]);
        }
        setSkillInput("");
    };

    const removeSkill = (skillToRemove: string) => {
        updateFormData(
            "skills",
            formData.skills.filter((skill) => skill !== skillToRemove)
        );
    };

    const handleSkillKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && skillInput.trim()) {
            e.preventDefault();
            addSkill(skillInput);
        }
    };

    const canProceedToStep2 = () => {
        return (
            formData.username.trim() !== "" &&
            formData.instituteName.trim() !== "" &&
            formData.academicYear !== "" &&
            formData.course !== "" &&
            formData.specialization !== ""
        );
    };

    const canProceedToStep3 = () => {
        return formData.whatsappNumber.trim() !== "";
    };

    const canSubmit = () => {
        return formData.shortBio.trim() !== "" && formData.skills.length >= 1;
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast({
                    title: "File too large",
                    description: "Please select an image under 5MB",
                    variant: "destructive",
                });
                return;
            }

            // Check file type
            if (!file.type.startsWith("image/")) {
                toast({
                    title: "Invalid file type",
                    description: "Please select an image file",
                    variant: "destructive",
                });
                return;
            }

            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadAvatar = async (): Promise<string | null> => {
        if (!avatarFile || !user?.id) return null;

        setIsUploadingAvatar(true);
        try {
            const fileExt = avatarFile.name.split(".").pop()?.toLowerCase() || 'jpg';
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;

            console.log("Uploading avatar:", fileName, "Size:", avatarFile.size, "Type:", avatarFile.type);

            const { data, error: uploadError } = await supabase.storage
                .from("user-avatars")
                .upload(fileName, avatarFile, {
                    upsert: true,
                    contentType: avatarFile.type
                });

            if (uploadError) {
                console.error("Upload error details:", {
                    message: uploadError.message,
                    name: uploadError.name,
                    // @ts-ignore - accessing additional error properties
                    statusCode: uploadError.statusCode,
                    error: uploadError
                });
                toast({
                    title: "Image Upload Failed",
                    description: uploadError.message || "Could not upload profile picture. Please check bucket permissions.",
                    variant: "destructive",
                });
                return null;
            }

            console.log("Upload successful:", data);

            const { data: { publicUrl } } = supabase.storage
                .from("user-avatars")
                .getPublicUrl(fileName);

            console.log("Public URL:", publicUrl);
            return publicUrl;
        } catch (error) {
            console.error("Avatar upload error:", error);
            toast({
                title: "Upload Error",
                description: "An unexpected error occurred. Please try again.",
                variant: "destructive",
            });
            return null;
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handleSubmit = async () => {
        if (!user?.id) return;

        setIsSubmitting(true);

        try {
            // Upload avatar if selected
            let avatarUrl = profile?.avatar_url || null;
            if (avatarFile) {
                const uploadedUrl = await uploadAvatar();
                if (uploadedUrl) {
                    avatarUrl = uploadedUrl;
                }
            }

            const { error } = await supabase
                .from("users")
                .update({
                    username: formData.username,
                    institute_name: formData.instituteName,
                    whatsapp_number: formData.whatsappNumber,
                    academic_year: formData.academicYear,
                    course: formData.course,
                    specialization: formData.specialization,
                    short_bio: formData.shortBio,
                    skills: formData.skills,
                    linkedin_url: formData.linkedinUrl,
                    github_username: formData.githubUsername,
                    avatar_url: avatarUrl,
                    profile_completed: true,
                    profile_completed_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .eq("id", user.id);

            if (error) throw error;

            await refreshProfile();

            // Navigate to profile if editing, or to build if first time setup
            const isEditing = profile?.profile_completed;

            toast({
                title: isEditing ? "Profile updated! ✨" : "Profile completed! 🎉",
                description: isEditing
                    ? "Your changes have been saved successfully."
                    : "Welcome to Skill Genome. Let's build your skill genome!",
            });

            navigate(isEditing ? "/profile" : "/build");
        } catch (error) {
            console.error("Error saving profile:", error);
            toast({
                title: "Error saving profile",
                description: "Please try again later.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const stepVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 100 : -100,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 100 : -100,
            opacity: 0,
        }),
    };

    return (
        <div className="min-h-screen bg-background">
            <main className="pt-12 pb-12">
                <div className="container mx-auto px-4 max-w-2xl">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-8"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-primary">
                                Complete Your Profile
                            </span>
                        </div>
                        <h1 className="text-3xl font-display font-bold text-foreground mb-2">
                            Let's set up your profile
                        </h1>
                        <p className="text-muted-foreground">
                            Help us personalize your experience
                        </p>
                    </motion.div>

                    {/* Progress Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mb-8"
                    >
                        <div className="flex items-center justify-between mb-2">
                            {[1, 2, 3].map((step) => (
                                <div key={step} className="flex items-center">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${currentStep >= step
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-secondary text-muted-foreground"
                                            }`}
                                    >
                                        {currentStep > step ? (
                                            <Check className="w-5 h-5" />
                                        ) : (
                                            step
                                        )}
                                    </div>
                                    {step < 3 && (
                                        <div
                                            className={`w-24 sm:w-32 h-1 mx-2 rounded-full transition-all duration-300 ${currentStep > step ? "bg-primary" : "bg-secondary"
                                                }`}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Basic Info</span>
                            <span>Contact</span>
                            <span>Skills & Bio</span>
                        </div>
                    </motion.div>

                    {/* Form Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="relative"
                    >
                        {/* Gradient border glow */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-2xl blur opacity-30" />

                        <div className="relative bg-genome-card border border-white/10 rounded-2xl p-6 sm:p-8">
                            <AnimatePresence mode="wait" custom={currentStep}>
                                {/* Step 1: Basic Info */}
                                {currentStep === 1 && (
                                    <motion.div
                                        key="step1"
                                        custom={1}
                                        variants={stepVariants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        transition={{ duration: 0.3 }}
                                        className="space-y-6"
                                    >
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 rounded-lg bg-primary/10">
                                                <GraduationCap className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-semibold text-foreground">
                                                    Basic Information
                                                </h2>
                                                <p className="text-sm text-muted-foreground">
                                                    Profile picture and education
                                                </p>
                                            </div>
                                        </div>

                                        {/* Avatar Upload */}
                                        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-xl bg-white/5 mb-6">
                                            <div className="relative group cursor-pointer">
                                                <div className="w-24 h-24 rounded-full overflow-hidden bg-secondary border-2 border-border mb-3 group-hover:border-primary transition-colors">
                                                    {avatarPreview ? (
                                                        <img
                                                            src={avatarPreview}
                                                            alt="Avatar preview"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-secondary">
                                                            <User className="w-10 h-10 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                </div>
                                                <label
                                                    htmlFor="avatar-upload"
                                                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg cursor-pointer hover:bg-primary/90 transition-colors"
                                                >
                                                    <Camera className="w-4 h-4" />
                                                </label>
                                                <input
                                                    id="avatar-upload"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleAvatarChange}
                                                    className="hidden"
                                                    disabled={isUploadingAvatar}
                                                />
                                            </div>
                                            <p className="text-sm font-medium text-foreground">
                                                {isUploadingAvatar ? "Uploading..." : "Upload Profile Picture"}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                JPG, PNG or GIF (Max 5MB)
                                            </p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="username" className="flex items-center gap-2">
                                                    <AtSign className="w-4 h-4 text-muted-foreground" />
                                                    Username *
                                                </Label>
                                                <Input
                                                    id="username"
                                                    placeholder="e.g., john_doe"
                                                    value={formData.username}
                                                    onChange={(e) =>
                                                        updateFormData("username", e.target.value.toLowerCase().replace(/\s/g, '_'))
                                                    }
                                                    className="bg-background/50"
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    This will be your unique identifier
                                                </p>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="institute" className="flex items-center gap-2">
                                                    <Building className="w-4 h-4 text-muted-foreground" />
                                                    Institute Name *
                                                </Label>
                                                <Input
                                                    id="institute"
                                                    placeholder="e.g., IIT Delhi, NIT Trichy, VIT Vellore"
                                                    value={formData.instituteName}
                                                    onChange={(e) =>
                                                        updateFormData("instituteName", e.target.value)
                                                    }
                                                    className="bg-background/50"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="year" className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-muted-foreground" />
                                                        Academic Year *
                                                    </Label>
                                                    <Select
                                                        value={formData.academicYear}
                                                        onValueChange={(value) =>
                                                            updateFormData("academicYear", value)
                                                        }
                                                    >
                                                        <SelectTrigger className="bg-background/50">
                                                            <SelectValue placeholder="Select year" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {ACADEMIC_YEARS.map((year) => (
                                                                <SelectItem key={year} value={year}>
                                                                    {year}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="course" className="flex items-center gap-2">
                                                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                                                        Course *
                                                    </Label>
                                                    <Select
                                                        value={formData.course}
                                                        onValueChange={(value) =>
                                                            updateFormData("course", value)
                                                        }
                                                    >
                                                        <SelectTrigger className="bg-background/50">
                                                            <SelectValue placeholder="Select course" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {COURSES.map((course) => (
                                                                <SelectItem key={course} value={course}>
                                                                    {course}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="specialization" className="flex items-center gap-2">
                                                    <Code className="w-4 h-4 text-muted-foreground" />
                                                    Specialization *
                                                </Label>
                                                <Select
                                                    value={formData.specialization}
                                                    onValueChange={(value) =>
                                                        updateFormData("specialization", value)
                                                    }
                                                >
                                                    <SelectTrigger className="bg-background/50">
                                                        <SelectValue placeholder="Select specialization" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {SPECIALIZATIONS.map((spec) => (
                                                            <SelectItem key={spec} value={spec}>
                                                                {spec}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Step 2: Contact & Social */}
                                {currentStep === 2 && (
                                    <motion.div
                                        key="step2"
                                        custom={2}
                                        variants={stepVariants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        transition={{ duration: 0.3 }}
                                        className="space-y-6"
                                    >
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 rounded-lg bg-primary/10">
                                                <LinkIcon className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-semibold text-foreground">
                                                    Contact & Social
                                                </h2>
                                                <p className="text-sm text-muted-foreground">
                                                    How can we reach you?
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="whatsapp" className="flex items-center gap-2">
                                                    <Phone className="w-4 h-4 text-muted-foreground" />
                                                    WhatsApp Number *
                                                </Label>
                                                <Input
                                                    id="whatsapp"
                                                    placeholder="+91 98765 43210"
                                                    value={formData.whatsappNumber}
                                                    onChange={(e) =>
                                                        updateFormData("whatsappNumber", e.target.value)
                                                    }
                                                    className="bg-background/50"
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    We'll use this for important updates only
                                                </p>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="linkedin" className="flex items-center gap-2">
                                                    <Linkedin className="w-4 h-4 text-muted-foreground" />
                                                    LinkedIn Profile URL
                                                </Label>
                                                <Input
                                                    id="linkedin"
                                                    placeholder="https://linkedin.com/in/yourprofile"
                                                    value={formData.linkedinUrl}
                                                    onChange={(e) =>
                                                        updateFormData("linkedinUrl", e.target.value)
                                                    }
                                                    className="bg-background/50"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="github" className="flex items-center gap-2">
                                                    <Github className="w-4 h-4 text-muted-foreground" />
                                                    GitHub Username
                                                </Label>
                                                <div className="flex">
                                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                                                        github.com/
                                                    </span>
                                                    <Input
                                                        id="github"
                                                        placeholder="username"
                                                        value={formData.githubUsername}
                                                        onChange={(e) =>
                                                            updateFormData("githubUsername", e.target.value)
                                                        }
                                                        className="bg-background/50 rounded-l-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Step 3: Skills & Bio */}
                                {currentStep === 3 && (
                                    <motion.div
                                        key="step3"
                                        custom={3}
                                        variants={stepVariants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        transition={{ duration: 0.3 }}
                                        className="space-y-6"
                                    >
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 rounded-lg bg-primary/10">
                                                <User className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-semibold text-foreground">
                                                    Skills & Bio
                                                </h2>
                                                <p className="text-sm text-muted-foreground">
                                                    Tell us about yourself
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="bio" className="flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-muted-foreground" />
                                                    Short Bio *
                                                </Label>
                                                <Textarea
                                                    id="bio"
                                                    placeholder="I'm a passionate developer who loves building..."
                                                    value={formData.shortBio}
                                                    onChange={(e) =>
                                                        updateFormData("shortBio", e.target.value.slice(0, 280))
                                                    }
                                                    className="bg-background/50 min-h-[100px] resize-none"
                                                />
                                                <div className="flex justify-end">
                                                    <span
                                                        className={`text-xs ${formData.shortBio.length > 250
                                                            ? "text-yellow-500"
                                                            : "text-muted-foreground"
                                                            }`}
                                                    >
                                                        {formData.shortBio.length}/280
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2">
                                                    <Sparkles className="w-4 h-4 text-muted-foreground" />
                                                    Skills * (Add at least 1)
                                                </Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        placeholder="Type a skill and press Enter"
                                                        value={skillInput}
                                                        onChange={(e) => setSkillInput(e.target.value)}
                                                        onKeyDown={handleSkillKeyDown}
                                                        className="bg-background/50"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => addSkill(skillInput)}
                                                        disabled={!skillInput.trim()}
                                                    >
                                                        Add
                                                    </Button>
                                                </div>

                                                {/* Selected Skills */}
                                                {formData.skills.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mt-3">
                                                        {formData.skills.map((skill) => (
                                                            <span
                                                                key={skill}
                                                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
                                                            >
                                                                {skill}
                                                                <button
                                                                    onClick={() => removeSkill(skill)}
                                                                    className="ml-1 hover:text-red-400 transition-colors"
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Skill Suggestions */}
                                                <div className="pt-2">
                                                    <p className="text-xs text-muted-foreground mb-2">
                                                        Suggestions:
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {SKILL_SUGGESTIONS.filter(
                                                            (s) => !formData.skills.includes(s)
                                                        )
                                                            .slice(0, 8)
                                                            .map((skill) => (
                                                                <button
                                                                    key={skill}
                                                                    onClick={() => addSkill(skill)}
                                                                    className="px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs hover:bg-secondary/80 transition-colors"
                                                                >
                                                                    + {skill}
                                                                </button>
                                                            ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Navigation Buttons */}
                            <div className="flex justify-between mt-8 pt-6 border-t border-border">
                                <Button
                                    variant="ghost"
                                    onClick={prevStep}
                                    disabled={currentStep === 1}
                                    className={currentStep === 1 ? "invisible" : ""}
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back
                                </Button>

                                {currentStep < totalSteps ? (
                                    <Button
                                        variant="genome"
                                        onClick={nextStep}
                                        disabled={
                                            (currentStep === 1 && !canProceedToStep2()) ||
                                            (currentStep === 2 && !canProceedToStep3())
                                        }
                                    >
                                        Next
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                ) : (
                                    <Button
                                        variant="genome"
                                        onClick={handleSubmit}
                                        disabled={!canSubmit() || isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                Complete Profile
                                                <Check className="w-4 h-4 ml-2" />
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default CompleteProfile;
