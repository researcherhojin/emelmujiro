/**
 * Optimize imports for better tree shaking
 */

// Date-fns - import only what we need
export { format, parseISO, formatDistanceToNow } from 'date-fns';
export { ko } from 'date-fns/locale';

// Lucide React - import specific icons
export {
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Search,
  Home,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Star,
  Heart,
  Share2,
  Download,
  Upload,
  Settings,
  LogOut,
  LogIn,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  Info,
  Loader2,
  Send,
  MessageSquare,
  FileText,
  Image,
  Video,
  Paperclip,
  Trash2,
  Edit,
  Plus,
  Minus,
  Eye,
  EyeOff,
  Filter,
  SortAsc,
  SortDesc,
  MoreVertical,
  MoreHorizontal,
  Globe,
  Github,
  Linkedin,
  Twitter,
} from 'lucide-react';

// Lazy load heavy components
import { lazy } from 'react';

export const FramerMotion = {
  motion: lazy(() =>
    import('framer-motion').then((mod) => ({ default: mod.motion }))
  ),
  AnimatePresence: lazy(() =>
    import('framer-motion').then((mod) => ({ default: mod.AnimatePresence }))
  ),
};

// React Markdown - lazy load
export const ReactMarkdown = lazy(() => import('react-markdown'));
export const remarkGfm = () => import('remark-gfm');
