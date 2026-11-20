'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@lms/ui';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/lib/auth-context';
import {
  fetchCourses,
  fetchCourseModules,
  fetchCourseNotes,
  updateCourseProgress,
  deleteLiveSession,
  deleteCourseModule,
} from '@/lib/store';
import { Course, CourseModuleItem, CourseResourceNote } from '@/lib/types';
import { getCourseLabTemplate, CourseLabTemplate } from '@/lib/course-content';
import { NotificationCenter } from '@/components/NotificationCenter';
import { InstructorStudioModal } from '@/components/InstructorStudioModal';
import { ScheduleLiveClassModal } from '@/components/ScheduleLiveClassModal';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import {
  CheckCircle,
  ArrowLeft,
  FileCode,
  RotateCcw,
  Flag,
  Clock,
  Send,
  Terminal as TerminalIcon,
  Video,
  Radio,
  Download,
  Users,
  Maximize2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  FileText,
  Upload,
  Sparkles,
  Mic,
  MicOff,
  VideoOff,
  Hand,
  Copy,
  PhoneOff,
  Check,
  Monitor,
  MonitorOff,
  Lock,
  Unlock,
  UserCheck,
  UserX,
  Shield,
  Trash2,
  GraduationCap,
  MessageSquare,
} from 'lucide-react';

interface RemotePeer {
  peerId: string;
  userId: string;
  name: string;
  role: string;
  stream?: MediaStream | null;
  isMicOn: boolean;
  isCameraOn: boolean;
  isScreenSharing: boolean;
  isMutedLocally?: boolean;
}

interface WaitingLearner {
  id: string;
  name: string;
  email: string;
  role: string;
  requestedAt: string;
}

interface RemoteVideoTileProps {
  peer: RemotePeer;
  onMuteToggle: (peerId: string) => void;
}

function RemoteVideoTile({ peer, onMuteToggle }: RemoteVideoTileProps) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  React.useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    // Mobile WebKit / Safari requirement: imperative muted & playsInline
    el.muted = true;
    el.defaultMuted = true;
    el.playsInline = true;
    el.setAttribute('playsinline', 'true');
    el.setAttribute('webkit-playsinline', 'true');

    if (peer.stream) {
      if (el.srcObject !== peer.stream) {
        el.srcObject = peer.stream;
      }
      const playPromise = el.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    }

    const stream = peer.stream;
    if (!stream) return;

    const handleTrackChange = () => {
      if (el && stream) {
        el.muted = true;
        el.defaultMuted = true;
        el.playsInline = true;
        el.setAttribute('playsinline', 'true');
        el.setAttribute('webkit-playsinline', 'true');
        el.srcObject = stream;
        el.play().catch(() => {});
      }
    };
    stream.addEventListener('addtrack', handleTrackChange);
    stream.addEventListener('removetrack', handleTrackChange);
    stream.getVideoTracks().forEach((track) => {
      track.addEventListener('unmute', handleTrackChange);
    });

    return () => {
      stream.removeEventListener('addtrack', handleTrackChange);
      stream.removeEventListener('removetrack', handleTrackChange);
      stream.getVideoTracks().forEach((track) => {
        track.removeEventListener('unmute', handleTrackChange);
      });
    };
  }, [peer.stream, peer.isCameraOn]);

  const showVideo = peer.isCameraOn !== false;

  return (
    <div className="relative aspect-video rounded-xl overflow-hidden bg-[#0A0A12] border border-zinc-800 shadow-xl flex items-center justify-center">
      <video
        ref={(el) => {
          videoRef.current = el;
          if (el) {
            el.muted = true;
            el.defaultMuted = true;
            el.playsInline = true;
            el.setAttribute('playsinline', 'true');
            el.setAttribute('webkit-playsinline', 'true');
            if (peer.stream && el.srcObject !== peer.stream) {
              el.srcObject = peer.stream;
              el.play().catch(() => {});
            }
          }
        }}
        autoPlay
        playsInline
        // @ts-ignore
        webkit-playsinline="true"
        muted={true}
        onLoadedMetadata={(e) => {
          const v = e.currentTarget;
          v.muted = true;
          v.defaultMuted = true;
          v.playsInline = true;
          v.play().catch(() => {});
        }}
        className={
          showVideo
            ? 'w-full h-full object-cover'
            : 'opacity-0 absolute pointer-events-none w-0 h-0'
        }
      />

      {/* Fallback Avatar when Camera is OFF */}
      {!showVideo && (
        <div className="flex flex-col items-center justify-center gap-2 text-zinc-500 py-6">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-950 border-2 border-zinc-700/80 flex items-center justify-center text-white font-bold text-lg shadow-xl">
            {(peer.name || 'P').charAt(0).toUpperCase()}
          </div>
          <div className="text-center">
            <div className="text-xs font-bold text-zinc-200">{peer.name}</div>
            <span className="text-[10px] font-mono text-zinc-500">Camera is Off</span>
          </div>
        </div>
      )}

      {/* Peer Badge */}
      <div className="absolute top-2.5 left-2.5 z-10 px-2.5 py-1 rounded-lg bg-black/80 border border-zinc-800 text-[10px] font-mono text-white flex items-center gap-1.5 backdrop-blur-md">
        <span className={`w-2 h-2 rounded-full ${peer.role === 'instructor' ? 'bg-red-500 animate-pulse' : peer.role === 'admin' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
        <span className="font-bold">{peer.name}</span>
        <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
          peer.role === 'instructor'
            ? 'bg-red-950 text-red-400 border border-red-900/60'
            : peer.role === 'admin'
            ? 'bg-amber-950 text-amber-400 border border-amber-900/60'
            : 'bg-emerald-950 text-emerald-400 border border-emerald-900/60'
        }`}>
          {peer.role === 'instructor' ? 'HOST' : peer.role === 'admin' ? 'ADMIN' : 'LEARNER'}
        </span>
      </div>

      {/* Audio Mute Control for Testing */}
      <div className="absolute bottom-2.5 right-2.5 z-10">
        <button
          type="button"
          onClick={() => onMuteToggle(peer.peerId)}
          className={`p-1.5 rounded-lg border backdrop-blur-md transition-colors ${
            peer.isMutedLocally
              ? 'bg-red-950/80 border-red-800 text-red-400'
              : 'bg-black/80 border-zinc-700 text-zinc-300 hover:text-white'
          }`}
          title={peer.isMutedLocally ? 'Unmute participant for you' : 'Mute participant for you'}
        >
          {peer.isMutedLocally ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}

export default function CoursePlayerPage({ params }: { params: { enrollmentId: string } }) {
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [template, setTemplate] = useState<CourseLabTemplate | null>(null);
  const [courseModules, setCourseModules] = useState<CourseModuleItem[]>([]);
  const [courseNotes, setCourseNotes] = useState<CourseResourceNote[]>([]);
  const [activeTab, setActiveTab] = useState<'lecture' | 'live' | 'guide' | 'terminal' | 'notes' | 'flags'>('guide');

  // Instructor studio state
  const [isInstructorStudioOpen, setIsInstructorStudioOpen] = useState(false);
  const [isScheduleLiveOpen, setIsScheduleLiveOpen] = useState(false);

  // WebRTC Hardware Media Refs
  const localVideoRef = React.useRef<HTMLVideoElement | null>(null);
  const screenVideoRef = React.useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = React.useRef<MediaStream | null>(null);
  const screenStreamRef = React.useRef<MediaStream | null>(null);
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const analyserRef = React.useRef<AnalyserNode | null>(null);
  const animFrameRef = React.useRef<number | null>(null);
  const chatBottomRef = React.useRef<HTMLDivElement | null>(null);

  // Live room hardware & interactive state
  const [isInLiveRoom, setIsInLiveRoom] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [deviceError, setDeviceError] = useState<string | null>(null);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [liveSidebarTab, setLiveSidebarTab] = useState<'chat' | 'participants'>('chat');

  // Admission Control & Waiting Room State
  const [admissionStatus, setAdmissionStatus] = useState<'none' | 'waiting' | 'admitted' | 'denied'>('none');
  const [autoAdmitEveryone, setAutoAdmitEveryone] = useState<boolean>(true);
  const [waitingList, setWaitingList] = useState<WaitingLearner[]>([]);
  const [admittedIds, setAdmittedIds] = useState<string[]>([]);

  // Remote WebRTC Peers (Two-Way Video & Audio)
  const [remotePeers, setRemotePeers] = useState<RemotePeer[]>([]);
  const [mobileLiveView, setMobileLiveView] = useState<'stage' | 'chat' | 'participants'>('stage');
  const [needsAudioUnlock, setNeedsAudioUnlock] = useState(false);

  const peerConnectionsRef = React.useRef<{ [peerId: string]: RTCPeerConnection }>({});
  const peerUserIdMapRef = React.useRef<{ [peerId: string]: string }>({});
  const iceCandidateQueueRef = React.useRef<{ [peerId: string]: RTCIceCandidateInit[] }>({});
  const broadcastChannelRef = React.useRef<BroadcastChannel | null>(null);
  const admissionChannelRef = React.useRef<BroadcastChannel | null>(null);
  const sbChannelRef = React.useRef<any>(null);
  const processedMessagesRef = React.useRef<Set<string>>(new Set());
  const localPeerIdRef = React.useRef<string>('');
  const localTrackStateRef = React.useRef({ isCameraOn: false, isMicOn: false, isScreenSharing: false });
  const handlePeerMessageRef = React.useRef<((msg: any) => Promise<void>) | null>(null);
  const handleAdmissionMessageRef = React.useRef<((msg: any) => void) | null>(null);

  // Mobile WebRTC Audio & Video Autoplay Unlocker
  const unlockAudio = React.useCallback(() => {
    setNeedsAudioUnlock(false);
    try {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      const audios = document.querySelectorAll('audio');
      audios.forEach((a) => {
        a.play().catch(() => {});
      });
      const videos = document.querySelectorAll('video');
      videos.forEach((v) => {
        v.muted = true;
        v.defaultMuted = true;
        v.playsInline = true;
        v.setAttribute('playsinline', 'true');
        v.setAttribute('webkit-playsinline', 'true');
        v.play().catch(() => {});
      });
    } catch {}
  }, []);

  // Strict deduplication of remote peers by userId and peerId
  // Guarantees each participant only ever renders once even after refresh/reconnect
  const uniqueRemotePeers = React.useMemo(() => {
    const seenUserIds = new Set<string>();
    const seenPeerIds = new Set<string>();
    const list: RemotePeer[] = [];

    for (let i = remotePeers.length - 1; i >= 0; i--) {
      const p = remotePeers[i];
      if (!p) continue;
      if (user && p.userId && p.userId === user.id) continue;
      if (p.peerId === localPeerIdRef.current) continue;

      if (p.userId) {
        if (seenUserIds.has(p.userId)) continue;
        seenUserIds.add(p.userId);
      }
      if (seenPeerIds.has(p.peerId)) continue;
      seenPeerIds.add(p.peerId);

      list.unshift(p);
    }
    return list;
  }, [remotePeers, user]);

  // Video Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState('1x');
  const [videoProgress, setVideoProgress] = useState(38);

  // Terminal state
  const [terminalHistory, setTerminalHistory] = useState<string[]>([]);
  const [terminalCommand, setTerminalCommand] = useState('');

  // Flag & Progress state
  const [flagInput, setFlagInput] = useState('');
  const [flagSubmitted, setFlagSubmitted] = useState(false);

  // Live class chat state (Zero demo data)
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; sender: string; time: string; text: string; role?: string }>>([]);
  const [newChatInput, setNewChatInput] = useState('');

  // Synchronous resolution of canonical course/room ID
  // Ensures both Host and Learner bind to the exact same room channel from the first render
  const resolvedCourseId = React.useMemo(() => {
    if (course?.id) return course.id;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('dss_local_enrollments');
        if (stored) {
          const list = JSON.parse(stored);
          const found = list.find((e: any) => e.id === params.enrollmentId);
          if (found?.courseId) return found.courseId;
        }
      } catch {}
    }
    return params.enrollmentId || 'c0000000-0000-0000-0000-000000000101';
  }, [course?.id, params.enrollmentId]);

  const canonicalRoomId = resolvedCourseId;

  const loadCourseData = async () => {
    const courses = await fetchCourses();
    let matched = courses.find((c) => c.id === params.enrollmentId || c.slug === params.enrollmentId);
    if (!matched) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        try {
          const { data: enroll } = await supabase.from('enrollments').select('course_id').eq('id', params.enrollmentId).single();
          if (enroll?.course_id) {
            matched = courses.find((c) => c.id === enroll.course_id);
          }
        } catch {}
      }
    }
    if (!matched) {
      matched = courses[0];
    }
    if (matched) {
      setCourse(matched);
      const tmpl = getCourseLabTemplate(matched.title, matched.category, matched.targetLabIp);
      setTemplate(tmpl);
      setTerminalHistory(tmpl.terminalInitialHistory);

      const [mods, notes] = await Promise.all([
        fetchCourseModules(matched.id, matched.title, matched.category),
        fetchCourseNotes(matched.id, matched.title, matched.category),
      ]);
      setCourseModules(mods);
      setCourseNotes(notes);
    }
  };

  useEffect(() => {
    loadCourseData();
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('tab') === 'live') {
        setActiveTab('live');
        if (user) {
          if (user.role === 'admin' || user.role === 'instructor') {
            setAdmissionStatus('admitted');
            setIsInLiveRoom(true);
          } else {
            try {
              const current = localStorage.getItem(`dss_live_room_state_${canonicalRoomId}`);
              const parsed = current ? JSON.parse(current) : {};
              if (parsed.autoAdmitEveryone !== false || (Array.isArray(parsed.admittedIds) && parsed.admittedIds.includes(user.id))) {
                setAdmissionStatus('admitted');
                setIsInLiveRoom(true);
              }
            } catch {
              setAdmissionStatus('admitted');
              setIsInLiveRoom(true);
            }
          }
        }
      }
    }
  }, [params.enrollmentId, user, canonicalRoomId]);

  const isMessageProcessed = React.useCallback((msg: any): boolean => {
    if (!msg || typeof msg !== 'object') return true;
    const key =
      msg.msgId ||
      `${msg.type}_${msg.from || ''}_${msg.to || ''}_${msg.candidate?.candidate || (msg.sdp ? msg.sdp.type : '')}_${
        msg.message?.id || ''
      }_${msg.timestamp || ''}`;
    if (processedMessagesRef.current.has(key)) {
      return true;
    }
    processedMessagesRef.current.add(key);
    if (processedMessagesRef.current.size > 300) {
      const arr = Array.from(processedMessagesRef.current);
      processedMessagesRef.current = new Set(arr.slice(150));
    }
    return false;
  }, []);

  const broadcastRoomMessage = React.useCallback(
    (type: string, data: any) => {
      const msgId = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const fullMsg = { type, msgId, timestamp: Date.now(), ...data };
      processedMessagesRef.current.add(msgId);

      // 1. BroadcastChannel local fast-path
      try {
        broadcastChannelRef.current?.postMessage(fullMsg);
      } catch {}

      // 2. Admission BroadcastChannel if applicable
      try {
        admissionChannelRef.current?.postMessage(fullMsg);
      } catch {}

      // 3. Supabase Realtime cloud broadcast (works across all browsers, incognito, networks)
      if (sbChannelRef.current) {
        try {
          sbChannelRef.current.send({
            type: 'broadcast',
            event: type,
            payload: fullMsg,
          });
        } catch (e) {
          console.warn('Supabase Realtime broadcast error', e);
        }
      }
    },
    []
  );

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalCommand.trim() || !template) return;

    let response = '';
    const cmd = terminalCommand.trim().toLowerCase();
    const targetIp = course?.targetLabIp || template.defaultHostIp;

    if (cmd === 'help') {
      response = 'Available commands: curl, docker, npm, nmap, python3, whoami, ifconfig, cat user.txt, clear';
    } else if (cmd.includes('cat user.txt') || cmd.includes('flag')) {
      response = 'DSS{burp_repeater_sqli_byp4ss_9912}';
    } else if (cmd === 'whoami') {
      response = `${template.terminalUser} (uid=1000, gid=1000) on ${template.terminalHostname}`;
    } else if (cmd === 'ifconfig' || cmd === 'ip a') {
      response = `tun0: inet 10.10.14.82 netmask 255.255.254.0 (Dark Space Secure Tunnel)`;
    } else if (cmd === 'clear') {
      setTerminalHistory([`${template.terminalUser}@${template.terminalHostname}:~$ _`]);
      setTerminalCommand('');
      return;
    } else {
      response = `[+] Executed: ${cmd}\n[*] Target ${targetIp} responded 200 OK (Telemetry active)`;
    }

    setTerminalHistory((prev) => [
      ...prev.slice(0, -1),
      `${template.terminalUser}@${template.terminalHostname}:~$ ${terminalCommand}`,
      response,
      `${template.terminalUser}@${template.terminalHostname}:~$ _`,
    ]);
    setTerminalCommand('');
  };

  const handleFlagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (flagInput.trim().toUpperCase().includes('DSS{') || flagInput.length > 4) {
      setFlagSubmitted(true);
      if (user && course) {
        await updateCourseProgress(user.id, course.id, 100);
      }
    }
  };

  const chatStorageKey = `dss_live_chat_${canonicalRoomId}`;

  // Load chat and sync across tabs
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(chatStorageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            // Strip any legacy demo messages
            const filtered = parsed.filter(
              (m) => m && m.sender !== 'Operator_91' && m.sender !== 'Cadet_Z'
            );
            setChatMessages(filtered);
          }
        }
      } catch (e) {
        console.error('Error reading live chat:', e);
      }
    }

    const handleChatBroadcast = (e: any) => {
      if (e.detail?.courseId === canonicalRoomId && Array.isArray(e.detail?.messages)) {
        setChatMessages(e.detail.messages);
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === chatStorageKey && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setChatMessages(parsed);
          }
        } catch {}
      }
    };

    window.addEventListener('dss-live-chat-broadcast', handleChatBroadcast);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('dss-live-chat-broadcast', handleChatBroadcast);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [canonicalRoomId, chatStorageKey]);

  // Auto-scroll chat when messages update
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Synchronize local camera video element
  useEffect(() => {
    if (isCameraOn && localVideoRef.current && mediaStreamRef.current) {
      localVideoRef.current.srcObject = mediaStreamRef.current;
      localVideoRef.current.play().catch(() => {});
    }
  }, [isCameraOn, isScreenSharing]);

  // Synchronize screen share video element
  useEffect(() => {
    if (isScreenSharing && screenVideoRef.current && screenStreamRef.current) {
      screenVideoRef.current.srcObject = screenStreamRef.current;
      screenVideoRef.current.play().catch(() => {});
    }
  }, [isScreenSharing]);

  // Keep localTrackStateRef continuously in sync without triggering channel re-subscriptions
  useEffect(() => {
    localTrackStateRef.current = { isCameraOn, isMicOn, isScreenSharing };
  }, [isCameraOn, isMicOn, isScreenSharing]);

  // Room state key for admission & waiting queue
  const roomStateKey = `dss_live_room_state_${canonicalRoomId}`;

  const loadRoomState = React.useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(roomStateKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed.autoAdmitEveryone === 'boolean') {
          setAutoAdmitEveryone(parsed.autoAdmitEveryone);
        }
        if (Array.isArray(parsed.waitingList)) {
          setWaitingList(parsed.waitingList);
        }
        if (Array.isArray(parsed.admittedIds)) {
          setAdmittedIds(parsed.admittedIds);
        }
      }
    } catch (e) {
      console.error('Error reading live room state:', e);
    }
  }, [roomStateKey]);

  const handleAdmissionMessage = React.useCallback(
    (data: any) => {
      if (isMessageProcessed(data)) return;
      if (!data || typeof data !== 'object') return;

      if (data.type === 'learner-knocking' && data.learner) {
        setWaitingList((prev) => {
          if (prev.some((w) => w.id === data.learner.id)) return prev;
          return [...prev, data.learner];
        });
      } else if (data.type === 'learner-admitted') {
        if (user && user.id === data.learnerId) {
          setAdmissionStatus('admitted');
          setIsInLiveRoom(true);
        }
        setWaitingList((prev) => prev.filter((w) => w.id !== data.learnerId));
        setAdmittedIds((prev) => Array.from(new Set([...prev, data.learnerId])));
      } else if (data.type === 'learner-denied') {
        if (user && user.id === data.learnerId) {
          setAdmissionStatus('denied');
        }
        setWaitingList((prev) => prev.filter((w) => w.id !== data.learnerId));
      } else if (data.type === 'all-admitted') {
        if (user && user.role === 'learner') {
          setAdmissionStatus('admitted');
          setIsInLiveRoom(true);
        }
        setWaitingList([]);
        if (Array.isArray(data.learnerIds)) {
          setAdmittedIds((prev) => Array.from(new Set([...prev, ...data.learnerIds])));
        }
      } else if (data.type === 'auto-admit-changed') {
        setAutoAdmitEveryone(data.autoAdmit);
        if (data.autoAdmit && user && user.role === 'learner' && admissionStatus === 'waiting') {
          setAdmissionStatus('admitted');
          setIsInLiveRoom(true);
        }
      }
    },
    [isMessageProcessed, user, admissionStatus]
  );

  useEffect(() => {
    loadRoomState();

    const handleRoomStateEvent = () => {
      loadRoomState();
    };

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === roomStateKey) {
        loadRoomState();
      }
    };

    window.addEventListener('dss-room-state-updated', handleRoomStateEvent);
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      window.removeEventListener('dss-room-state-updated', handleRoomStateEvent);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, [roomStateKey, loadRoomState]);

  // Keep handleAdmissionMessage ref in sync
  useEffect(() => {
    handleAdmissionMessageRef.current = handleAdmissionMessage;
  }, [handleAdmissionMessage]);

  // 1. Room-Wide Cloud (Supabase Realtime) and Local BroadcastChannel Signaling
  // Stays permanently connected for the canonical room ID so knocking, admission,
  // chat, and presence signals work across all browser windows, incognito, and devices.
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let sbChannel: any = null;
    let webrtcChannel: BroadcastChannel | null = null;
    let admChannel: BroadcastChannel | null = null;

    try {
      webrtcChannel = new BroadcastChannel(`dss_webrtc_p2p_${canonicalRoomId}`);
      broadcastChannelRef.current = webrtcChannel;
      webrtcChannel.onmessage = async (event) => {
        if (handlePeerMessageRef.current) {
          await handlePeerMessageRef.current(event.data);
        }
      };
    } catch {}

    try {
      admChannel = new BroadcastChannel(`dss_adm_${canonicalRoomId}`);
      admissionChannelRef.current = admChannel;
      admChannel.onmessage = (event) => {
        if (handleAdmissionMessageRef.current) {
          handleAdmissionMessageRef.current(event.data);
        }
      };
    } catch {}

    if (supabase) {
      try {
        sbChannel = supabase.channel(`dss_cloud_live_${canonicalRoomId}`, {
          config: { broadcast: { self: false } },
        });
        sbChannelRef.current = sbChannel;

        sbChannel
          .on('broadcast', { event: 'peer-presence' }, (e: any) => handlePeerMessageRef.current?.(e.payload))
          .on('broadcast', { event: 'track-state-changed' }, (e: any) => handlePeerMessageRef.current?.(e.payload))
          .on('broadcast', { event: 'webrtc-offer' }, (e: any) => handlePeerMessageRef.current?.(e.payload))
          .on('broadcast', { event: 'webrtc-answer' }, (e: any) => handlePeerMessageRef.current?.(e.payload))
          .on('broadcast', { event: 'webrtc-candidate' }, (e: any) => handlePeerMessageRef.current?.(e.payload))
          .on('broadcast', { event: 'peer-leave' }, (e: any) => handlePeerMessageRef.current?.(e.payload))
          .on('broadcast', { event: 'learner-knocking' }, (e: any) => handleAdmissionMessageRef.current?.(e.payload))
          .on('broadcast', { event: 'learner-admitted' }, (e: any) => handleAdmissionMessageRef.current?.(e.payload))
          .on('broadcast', { event: 'learner-denied' }, (e: any) => handleAdmissionMessageRef.current?.(e.payload))
          .on('broadcast', { event: 'all-admitted' }, (e: any) => handleAdmissionMessageRef.current?.(e.payload))
          .on('broadcast', { event: 'auto-admit-changed' }, (e: any) => handleAdmissionMessageRef.current?.(e.payload))
          .on('broadcast', { event: 'chat-message' }, (e: any) => {
            const data = e.payload;
            if (isMessageProcessed(data)) return;
            if (data?.message) {
              setChatMessages((prev) => {
                if (prev.some((m) => m.id === data.message.id)) return prev;
                const updated = [...prev, data.message];
                try {
                  localStorage.setItem(chatStorageKey, JSON.stringify(updated));
                } catch {}
                return updated;
              });
            }
          })
          .on('broadcast', { event: 'session-ended' }, (e: any) => {
            if (isMessageProcessed(e.payload)) return;
            handleLeaveRoom();
            alert('The live class session was ended by the instructor.');
          })
          .subscribe((status: string) => {
            if (status === 'SUBSCRIBED') {
              if (localPeerIdRef.current) {
                broadcastRoomMessage('peer-presence', {
                  from: localPeerIdRef.current,
                  userId: user?.id,
                  name: user?.name || user?.email?.split('@')[0] || 'User',
                  role: user?.role || 'learner',
                  broadcast: true,
                  isCameraOn: localTrackStateRef.current.isCameraOn,
                  isMicOn: localTrackStateRef.current.isMicOn,
                  isScreenSharing: localTrackStateRef.current.isScreenSharing,
                });
              }
            }
          });
      } catch (err) {
        console.warn('Supabase Realtime setup warning:', err);
      }
    }

    return () => {
      if (webrtcChannel) {
        webrtcChannel.close();
        broadcastChannelRef.current = null;
      }
      if (admChannel) {
        admChannel.close();
        admissionChannelRef.current = null;
      }
      if (sbChannel && supabase) {
        try {
          supabase.removeChannel(sbChannel);
        } catch {}
        sbChannelRef.current = null;
      }
    };
  }, [canonicalRoomId, chatStorageKey, isMessageProcessed]);

  // Auto-admit learner if policy allows or previously admitted
  useEffect(() => {
    if (user && admissionStatus === 'waiting') {
      if (autoAdmitEveryone || admittedIds.includes(user.id)) {
        setAdmissionStatus('admitted');
        setIsInLiveRoom(true);
      }
    }
  }, [autoAdmitEveryone, admittedIds, admissionStatus, user]);

  // 2. Active In-Room WebRTC Peer Session (Two-Way Video & Audio)
  // Activates when the user is admitted and inside the live classroom.
  useEffect(() => {
    if (!isInLiveRoom || admissionStatus !== 'admitted') return;

    const myPeerId = `peer_${user?.id || 'anon'}_${Math.random().toString(36).substring(2, 7)}`;
    localPeerIdRef.current = myPeerId;

    const setupPeerConnection = (
      targetPeerId: string,
      targetUserId: string,
      targetName: string,
      targetRole: string,
      isInitiator: boolean
    ) => {
      // If we already have a healthy active connection for targetPeerId, reuse it
      const existingPc = peerConnectionsRef.current[targetPeerId];
      if (existingPc && existingPc.connectionState !== 'failed' && existingPc.connectionState !== 'closed') {
        return existingPc;
      }
      if (existingPc) {
        try { existingPc.close(); } catch {}
        delete peerConnectionsRef.current[targetPeerId];
      }

      // Purge any older connection for the same user (e.g. they refreshed their browser)
      if (targetUserId) {
        Object.keys(peerConnectionsRef.current).forEach((pId) => {
          if (pId !== targetPeerId && peerUserIdMapRef.current[pId] === targetUserId) {
            try {
              peerConnectionsRef.current[pId]?.close();
            } catch {}
            delete peerConnectionsRef.current[pId];
            delete peerUserIdMapRef.current[pId];
          }
        });
      }

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
          { urls: 'stun:stun4.l.google.com:19302' },
          { urls: 'stun:stun.cloudflare.com:3478' },
          {
            urls: [
              'turn:openrelay.metered.ca:80',
              'turn:openrelay.metered.ca:443',
              'turn:openrelay.metered.ca:443?transport=tcp',
            ],
            username: 'openrelayproject',
            credential: 'openrelayproject',
          },
        ],
      });

      // 1. Initial transceivers or tracks for two-way audio & video
      const currentVideoTrack = mediaStreamRef.current?.getVideoTracks()[0] || null;
      const currentAudioTrack = mediaStreamRef.current?.getAudioTracks()[0] || null;

      try {
        if (currentVideoTrack) {
          pc.addTrack(currentVideoTrack, mediaStreamRef.current!);
        } else {
          pc.addTransceiver('video', { direction: 'sendrecv' });
        }
      } catch (err) {
        console.warn('Error configuring video transceiver:', err);
      }

      try {
        if (currentAudioTrack) {
          pc.addTrack(currentAudioTrack, mediaStreamRef.current!);
        } else {
          pc.addTransceiver('audio', { direction: 'sendrecv' });
        }
      } catch (err) {
        console.warn('Error configuring audio transceiver:', err);
      }

      // Prioritize H.264 video codec for iOS Safari & Android mobile hardware acceleration
      try {
        const videoTransceiver = pc.getTransceivers().find(
          (t) => (t.receiver && t.receiver.track?.kind === 'video') ||
                 (t.sender && t.sender.track?.kind === 'video')
        );
        if (videoTransceiver && 'setCodecPreferences' in videoTransceiver && typeof window !== 'undefined' && 'RTCRtpSender' in window && 'getCapabilities' in window.RTCRtpSender) {
          const capabilities = (window.RTCRtpSender as any).getCapabilities('video');
          if (capabilities && Array.isArray(capabilities.codecs)) {
            const h264 = capabilities.codecs.filter((c: any) => c.mimeType?.toLowerCase() === 'video/h264');
            const others = capabilities.codecs.filter((c: any) => c.mimeType?.toLowerCase() !== 'video/h264');
            (videoTransceiver as any).setCodecPreferences([...h264, ...others]);
          }
        }
      } catch (err) {
        console.warn('Codec preference warning:', err);
      }

      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => {
          try {
            pc.addTrack(track, screenStreamRef.current!);
          } catch {}
        });
      }

      pc.ontrack = (event) => {
        const incomingStream = event.streams[0] || new MediaStream([event.track]);

        // Unmute listener: fires when remote sender starts transmitting frames
        event.track.onunmute = () => {
          setRemotePeers((prev) =>
            prev.map((p) =>
              p.peerId === targetPeerId || (targetUserId && p.userId === targetUserId)
                ? {
                    ...p,
                    isCameraOn: event.track.kind === 'video' ? true : p.isCameraOn,
                    isMicOn: event.track.kind === 'audio' ? true : p.isMicOn,
                    stream: p.stream ? new MediaStream(p.stream.getTracks()) : incomingStream,
                  }
                : p
            )
          );
        };

        setRemotePeers((prev) => {
          const exists = prev.find((p) => p.peerId === targetPeerId || (targetUserId && p.userId === targetUserId));
          if (exists) {
            let activeStream = exists.stream;
            if (!activeStream) {
              activeStream = incomingStream;
            } else if (!activeStream.getTracks().some((t) => t.id === event.track.id)) {
              activeStream.addTrack(event.track);
            }
            const updatedStream = new MediaStream(activeStream.getTracks());
            return prev.map((p) =>
              p.peerId === exists.peerId
                ? {
                    ...p,
                    peerId: targetPeerId,
                    userId: targetUserId || p.userId,
                    stream: updatedStream,
                    isCameraOn: event.track.kind === 'video' ? true : p.isCameraOn,
                  }
                : p
            );
          }
          return [
            ...prev,
            {
              peerId: targetPeerId,
              userId: targetUserId,
              name: targetName,
              role: targetRole,
              stream: incomingStream,
              isMicOn: true,
              isCameraOn: event.track.kind === 'video' ? true : true,
              isScreenSharing: false,
              isMutedLocally: false,
            },
          ];
        });
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          broadcastRoomMessage('webrtc-candidate', {
            from: myPeerId,
            to: targetPeerId,
            candidate: event.candidate,
          });
        }
      };

      pc.onnegotiationneeded = async () => {
        try {
          // STRICT WebRTC glare guard: Only the initiator proactively initiates negotiation!
          if (!isInitiator) return;
          if (pc.signalingState !== 'stable') return;
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          broadcastRoomMessage('webrtc-offer', {
            from: myPeerId,
            to: targetPeerId,
            userId: user?.id,
            name: user?.name || user?.email?.split('@')[0] || 'User',
            role: user?.role || 'learner',
            sdp: offer,
          });
        } catch (e) {
          console.warn('Renegotiation error:', e);
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
          setTimeout(() => {
            if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
              try { pc.close(); } catch {}
              delete peerConnectionsRef.current[targetPeerId];
              delete peerUserIdMapRef.current[targetPeerId];
              delete iceCandidateQueueRef.current[targetPeerId];
              setRemotePeers((prev) => prev.filter((p) => p.peerId !== targetPeerId));
            }
          }, 3000);
        }
      };

      peerConnectionsRef.current[targetPeerId] = pc;
      if (targetUserId) {
        peerUserIdMapRef.current[targetPeerId] = targetUserId;
      }

      if (isInitiator) {
        // Wait briefly for local tracks to attach before sending initial offer
        setTimeout(async () => {
          try {
            if (pc.signalingState === 'stable' && !pc.currentLocalDescription) {
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              broadcastRoomMessage('webrtc-offer', {
                from: myPeerId,
                to: targetPeerId,
                userId: user?.id,
                name: user?.name || user?.email?.split('@')[0] || 'User',
                role: user?.role || 'learner',
                sdp: offer,
              });
            }
          } catch (err) {
            console.error('Error creating initial WebRTC offer:', err);
          }
        }, 80);
      }

      return pc;
    };

    const handlePeerMessage = async (msg: any) => {
      if (!msg || typeof msg !== 'object') return;
      if (msg.from === myPeerId) return;
      if (user && msg.userId && msg.userId === user.id) return;
      if (isMessageProcessed(msg)) return;

      if (msg.type === 'peer-presence') {
        // If presence has a userId, purge any old stale connections for that user
        if (msg.userId) {
          Object.keys(peerConnectionsRef.current).forEach((pId) => {
            if (pId !== msg.from && peerUserIdMapRef.current[pId] === msg.userId) {
              try {
                peerConnectionsRef.current[pId]?.close();
              } catch {}
              delete peerConnectionsRef.current[pId];
              delete peerUserIdMapRef.current[pId];
              delete iceCandidateQueueRef.current[pId];
            }
          });
        }
        peerUserIdMapRef.current[msg.from] = msg.userId || '';

        const existingPc = peerConnectionsRef.current[msg.from];
        const isInitiator = myPeerId > msg.from;

        // If no active peer connection exists, or previous one failed/closed, set it up
        if (!existingPc || existingPc.connectionState === 'failed' || existingPc.connectionState === 'closed') {
          setupPeerConnection(msg.from, msg.userId, msg.name, msg.role, isInitiator);
        }

        setRemotePeers((prev) => {
          // Filter out stale peers with same userId or same peerId
          const filtered = prev.filter((p) => {
            if (msg.userId && p.userId === msg.userId && p.peerId !== msg.from) {
              return false;
            }
            return p.peerId !== msg.from;
          });

          const existing = prev.find((p) => (msg.userId && p.userId === msg.userId) || p.peerId === msg.from);

          return [
            ...filtered,
            {
              peerId: msg.from,
              userId: msg.userId,
              name: msg.name || existing?.name || 'Participant',
              role: msg.role || existing?.role || 'learner',
              stream: existing?.stream || null,
              isMicOn: typeof msg.isMicOn === 'boolean' ? msg.isMicOn : existing ? existing.isMicOn : true,
              isCameraOn: typeof msg.isCameraOn === 'boolean' ? msg.isCameraOn : existing ? existing.isCameraOn : true,
              isScreenSharing: typeof msg.isScreenSharing === 'boolean' ? msg.isScreenSharing : existing ? existing.isScreenSharing : false,
              isMutedLocally: existing ? existing.isMutedLocally : false,
            },
          ];
        });

        // If newly discovered peer (we didn't have an active connection before) or broadcast requested, reply
        if (!existingPc || msg.broadcast) {
          announcePresence(false);
        }
      } else if (msg.type === 'track-state-changed') {
        setRemotePeers((prev) =>
          prev.map((p) =>
            p.peerId === msg.from || p.peerId === msg.peerId || (msg.userId && p.userId === msg.userId)
              ? {
                  ...p,
                  isCameraOn: typeof msg.isCameraOn === 'boolean' ? msg.isCameraOn : p.isCameraOn,
                  isMicOn: typeof msg.isMicOn === 'boolean' ? msg.isMicOn : p.isMicOn,
                  isScreenSharing: typeof msg.isScreenSharing === 'boolean' ? msg.isScreenSharing : p.isScreenSharing,
                }
              : p
          )
        );
      } else if (msg.type === 'webrtc-offer' && msg.to === myPeerId) {
        let pc = peerConnectionsRef.current[msg.from];
        if (!pc || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
          pc = setupPeerConnection(msg.from, msg.userId, msg.name, msg.role, false);
        }
        try {
          // WebRTC Glare / collision protection:
          // If we have an uncompleted local offer and receive an offer from remote:
          if (pc.signalingState === 'have-local-offer') {
            if (myPeerId < msg.from) {
              // Yield to remote peer with higher peerId
              await pc.setLocalDescription({ type: 'rollback' });
            } else {
              // Remote peer should rollback; ignore this colliding offer
              return;
            }
          }
          await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));

          // Flush any buffered candidates
          const queue = iceCandidateQueueRef.current[msg.from] || [];
          for (const cand of queue) {
            try { await pc.addIceCandidate(new RTCIceCandidate(cand)); } catch {}
          }
          delete iceCandidateQueueRef.current[msg.from];

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          broadcastRoomMessage('webrtc-answer', {
            from: myPeerId,
            to: msg.from,
            userId: user?.id,
            sdp: answer,
          });
        } catch (e) {
          console.error('Error handling WebRTC offer:', e);
        }
      } else if (msg.type === 'webrtc-answer' && msg.to === myPeerId) {
        const pc = peerConnectionsRef.current[msg.from];
        if (pc && pc.signalingState === 'have-local-offer') {
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));

            // Flush any buffered candidates
            const queue = iceCandidateQueueRef.current[msg.from] || [];
            for (const cand of queue) {
              try { await pc.addIceCandidate(new RTCIceCandidate(cand)); } catch {}
            }
            delete iceCandidateQueueRef.current[msg.from];
          } catch (e) {
            console.error('Error handling WebRTC answer:', e);
          }
        }
      } else if (msg.type === 'webrtc-candidate' && msg.to === myPeerId) {
        const pc = peerConnectionsRef.current[msg.from];
        if (msg.candidate) {
          if (pc && pc.remoteDescription && pc.remoteDescription.type) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
            } catch (e) {
              console.error('Error adding ICE candidate:', e);
            }
          } else {
            const queue = iceCandidateQueueRef.current[msg.from] || [];
            queue.push(msg.candidate);
            iceCandidateQueueRef.current[msg.from] = queue;
          }
        }
      } else if (msg.type === 'peer-leave') {
        const targetPeerId = msg.from;
        const targetUserId = msg.userId;
        if (targetPeerId && peerConnectionsRef.current[targetPeerId]) {
          try {
            peerConnectionsRef.current[targetPeerId].close();
          } catch {}
          delete peerConnectionsRef.current[targetPeerId];
          delete peerUserIdMapRef.current[targetPeerId];
          delete iceCandidateQueueRef.current[targetPeerId];
        }
        if (targetUserId) {
          Object.keys(peerConnectionsRef.current).forEach((pId) => {
            if (peerUserIdMapRef.current[pId] === targetUserId) {
              try {
                peerConnectionsRef.current[pId]?.close();
              } catch {}
              delete peerConnectionsRef.current[pId];
              delete peerUserIdMapRef.current[pId];
              delete iceCandidateQueueRef.current[pId];
            }
          });
        }
        setRemotePeers((prev) =>
          prev.filter((p) => {
            if (targetPeerId && p.peerId === targetPeerId) return false;
            if (targetUserId && p.userId === targetUserId) return false;
            return true;
          })
        );
      }
    };

    handlePeerMessageRef.current = handlePeerMessage;

    const announcePresence = (broadcast: boolean = false) => {
      broadcastRoomMessage('peer-presence', {
        from: myPeerId,
        userId: user?.id,
        name: user?.name || user?.email?.split('@')[0] || 'User',
        role: user?.role || 'learner',
        broadcast,
        isCameraOn,
        isMicOn,
        isScreenSharing,
      });
    };

    // Synchronous unload broadcast to immediately inform peers on refresh/close
    const handleBeforeUnload = () => {
      broadcastRoomMessage('peer-leave', {
        from: myPeerId,
        userId: user?.id,
      });
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    // Mobile visibilitychange listener: resume audio/video & re-announce presence
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        unlockAudio();
        announcePresence(false);
        syncLocalTracksToPeers(mediaStreamRef.current);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Announce presence across both Supabase Realtime and local BroadcastChannel
    announcePresence(true);

    // Continuous presence heartbeat every 2.5 seconds to guarantee instant peer discovery across network jumps
    const presenceHeartbeatInterval = setInterval(() => {
      announcePresence(false);
    }, 2500);

    return () => {
      clearInterval(presenceHeartbeatInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      broadcastRoomMessage('peer-leave', {
        from: myPeerId,
        userId: user?.id,
      });
      Object.values(peerConnectionsRef.current).forEach((pc) => {
        try {
          pc.close();
        } catch {}
      });
      peerConnectionsRef.current = {};
      peerUserIdMapRef.current = {};
      iceCandidateQueueRef.current = {};
      handlePeerMessageRef.current = null;
      setRemotePeers([]);
    };
  }, [isInLiveRoom, admissionStatus, canonicalRoomId, user, isMessageProcessed, broadcastRoomMessage]);

  // Synchronize local tracks to peer connections
  const syncLocalTracksToPeers = (stream: MediaStream | null) => {
    const videoTrack = stream?.getVideoTracks()[0] || null;
    const audioTrack = stream?.getAudioTracks()[0] || null;

    Object.values(peerConnectionsRef.current).forEach((pc) => {
      try {
        // Sync Video Track via Transceiver
        const videoTransceiver = pc.getTransceivers().find(
          (t) => (t.receiver && t.receiver.track?.kind === 'video') ||
                 (t.sender && t.sender.track?.kind === 'video')
        );
        if (videoTransceiver && videoTransceiver.sender) {
          videoTransceiver.sender.replaceTrack(videoTrack).catch((err) => {
            console.warn('Error replacing video track:', err);
          });
        } else if (videoTrack) {
          pc.addTrack(videoTrack, stream!);
        }

        // Sync Audio Track via Transceiver
        const audioTransceiver = pc.getTransceivers().find(
          (t) => (t.receiver && t.receiver.track?.kind === 'audio') ||
                 (t.sender && t.sender.track?.kind === 'audio')
        );
        if (audioTransceiver && audioTransceiver.sender) {
          audioTransceiver.sender.replaceTrack(audioTrack).catch((err) => {
            console.warn('Error replacing audio track:', err);
          });
        } else if (audioTrack) {
          pc.addTrack(audioTrack, stream!);
        }
      } catch (e) {
        console.warn('Error syncing tracks to peer:', e);
      }
    });
  };

  // Request to join room handler (Role-Based Admission)
  const handleRequestJoinRoom = () => {
    unlockAudio();
    if (!user) {
      alert('Please log in to enter the live classroom.');
      return;
    }

    // 1. ADMIN CAN JOIN ANY LIVE CLASS AT ANY TIME WITHOUT ANY PERMISSION
    if (user.role === 'admin') {
      setAdmissionStatus('admitted');
      setIsInLiveRoom(true);
      return;
    }

    // 2. INSTRUCTOR IS THE HOST, CAN JOIN DIRECTLY
    if (user.role === 'instructor') {
      setAdmissionStatus('admitted');
      setIsInLiveRoom(true);
      return;
    }

    // 3. LEARNER
    // Check if auto-admit is active or learner is already admitted
    if (autoAdmitEveryone || admittedIds.includes(user.id)) {
      setAdmissionStatus('admitted');
      setIsInLiveRoom(true);
      return;
    }

    // Otherwise, place in Waiting Room and knock
    setAdmissionStatus('waiting');
    const learnerName: string = (user.name || (user.email ? user.email.split('@')[0] : '')) || 'Learner';
    const knockEntry: WaitingLearner = {
      id: user.id,
      name: learnerName,
      email: user.email || '',
      role: user.role,
      requestedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setWaitingList((prev) => {
      const filtered = prev.filter((w) => w.id !== user.id);
      const updated = [...filtered, knockEntry];
      try {
        const current = localStorage.getItem(roomStateKey);
        const parsed = current ? JSON.parse(current) : {};
        localStorage.setItem(roomStateKey, JSON.stringify({ ...parsed, waitingList: updated }));
        window.dispatchEvent(new CustomEvent('dss-room-state-updated'));
      } catch {}
      return updated;
    });

    broadcastRoomMessage('learner-knocking', {
      learner: knockEntry,
    });
  };

  const handleAdmitLearner = (learnerId: string) => {
    setWaitingList((prev) => {
      const updatedWait = prev.filter((w) => w.id !== learnerId);
      setAdmittedIds((prevAdmitted) => {
        const updatedAdmitted = Array.from(new Set([...prevAdmitted, learnerId]));
        try {
          const current = localStorage.getItem(roomStateKey);
          const parsed = current ? JSON.parse(current) : {};
          localStorage.setItem(
            roomStateKey,
            JSON.stringify({
              ...parsed,
              waitingList: updatedWait,
              admittedIds: updatedAdmitted,
            })
          );
          window.dispatchEvent(new CustomEvent('dss-room-state-updated'));
        } catch {}
        return updatedAdmitted;
      });

      broadcastRoomMessage('learner-admitted', {
        learnerId,
      });

      return updatedWait;
    });
  };

  const handleDenyLearner = (learnerId: string) => {
    setWaitingList((prev) => {
      const updatedWait = prev.filter((w) => w.id !== learnerId);
      try {
        const current = localStorage.getItem(roomStateKey);
        const parsed = current ? JSON.parse(current) : {};
        localStorage.setItem(
          roomStateKey,
          JSON.stringify({ ...parsed, waitingList: updatedWait })
        );
        window.dispatchEvent(new CustomEvent('dss-room-state-updated'));
      } catch {}

      broadcastRoomMessage('learner-denied', {
        learnerId,
      });

      return updatedWait;
    });
  };

  const handleAdmitAll = () => {
    const allWaitingIds = waitingList.map((w) => w.id);
    setWaitingList([]);
    setAdmittedIds((prev) => {
      const updatedAdmitted = Array.from(new Set([...prev, ...allWaitingIds]));
      try {
        const current = localStorage.getItem(roomStateKey);
        const parsed = current ? JSON.parse(current) : {};
        localStorage.setItem(
          roomStateKey,
          JSON.stringify({
            ...parsed,
            waitingList: [],
            admittedIds: updatedAdmitted,
          })
        );
        window.dispatchEvent(new CustomEvent('dss-room-state-updated'));
      } catch {}
      return updatedAdmitted;
    });

    broadcastRoomMessage('all-admitted', {
      learnerIds: allWaitingIds,
    });
  };

  const handleToggleAutoAdmit = () => {
    const nextVal = !autoAdmitEveryone;
    setAutoAdmitEveryone(nextVal);

    if (nextVal) {
      handleAdmitAll();
    }

    try {
      const current = localStorage.getItem(roomStateKey);
      const parsed = current ? JSON.parse(current) : {};
      localStorage.setItem(
        roomStateKey,
        JSON.stringify({
          ...parsed,
          autoAdmitEveryone: nextVal,
        })
      );
      window.dispatchEvent(new CustomEvent('dss-room-state-updated'));
    } catch {}

    broadcastRoomMessage('auto-admit-changed', {
      autoAdmit: nextVal,
    });
  };

  const handleCancelWaiting = () => {
    setAdmissionStatus('none');
    if (user) {
      setWaitingList((prev) => {
        const updated = prev.filter((w) => w.id !== user.id);
        try {
          const current = localStorage.getItem(roomStateKey);
          const parsed = current ? JSON.parse(current) : {};
          localStorage.setItem(roomStateKey, JSON.stringify({ ...parsed, waitingList: updated }));
          window.dispatchEvent(new CustomEvent('dss-room-state-updated'));
        } catch {}
        return updated;
      });
    }
  };

  const toggleRemoteAudioMute = (peerId: string) => {
    setRemotePeers((prev) =>
      prev.map((p) => (p.peerId === peerId ? { ...p, isMutedLocally: !p.isMutedLocally } : p))
    );
  };

  // Cleanup all hardware streams on unmount
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
        screenStreamRef.current = null;
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    };
  }, []);

  const appendChatMessage = (text: string) => {
    const senderName: string = (user?.name || (user?.email ? user.email.split('@')[0] : '')) || 'Operator';
    const newMsg: { id: string; sender: string; time: string; text: string; role?: string } = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sender: senderName,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text,
      role: user?.role || 'learner',
    };

    setChatMessages((prev) => {
      const updated = [...prev, newMsg];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(chatStorageKey, JSON.stringify(updated));
          window.dispatchEvent(
            new CustomEvent('dss-live-chat-broadcast', {
              detail: { courseId: canonicalRoomId, messages: updated },
            })
          );
        } catch (e) {
          console.error('Chat storage error:', e);
        }
      }
      return updated;
    });

    broadcastRoomMessage('chat-message', {
      message: newMsg,
    });
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatInput.trim()) return;
    appendChatMessage(newChatInput.trim());
    setNewChatInput('');
  };

  const handleQuickReaction = (reaction: string) => {
    appendChatMessage(reaction);
  };

  const handleToggleHand = () => {
    const nextState = !isHandRaised;
    setIsHandRaised(nextState);
    if (nextState) {
      appendChatMessage('✋ Raised hand to ask a question.');
    }
  };

  // Hardware: WebRTC Camera Toggle
  const toggleCamera = async () => {
    setDeviceError(null);
    if (isCameraOn) {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getVideoTracks().forEach((track) => {
          track.stop();
          mediaStreamRef.current?.removeTrack(track);
        });
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      setIsCameraOn(false);
      syncLocalTracksToPeers(mediaStreamRef.current);
      broadcastRoomMessage('track-state-changed', {
        from: localPeerIdRef.current,
        peerId: localPeerIdRef.current,
        userId: user?.id,
        isCameraOn: false,
        isMicOn,
        isScreenSharing,
      });
    } else {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setDeviceError('Camera access is not supported by your browser.');
          return;
        }
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280, max: 1920 }, height: { ideal: 720, max: 1080 }, facingMode: 'user' },
          });
        } catch {
          // Mobile fallback for front-facing camera on devices failing exact resolution constraints
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' },
          });
        }
        const videoTrack = stream.getVideoTracks()[0];
        if (!mediaStreamRef.current) {
          mediaStreamRef.current = new MediaStream();
        }
        if (videoTrack) {
          // Clean up old video tracks if any
          mediaStreamRef.current.getVideoTracks().forEach((t) => {
            t.stop();
            mediaStreamRef.current?.removeTrack(t);
          });
          mediaStreamRef.current.addTrack(videoTrack);
          videoTrack.onended = () => {
            setIsCameraOn(false);
            syncLocalTracksToPeers(mediaStreamRef.current);
            broadcastRoomMessage('track-state-changed', {
              from: localPeerIdRef.current,
              peerId: localPeerIdRef.current,
              userId: user?.id,
              isCameraOn: false,
              isMicOn,
              isScreenSharing,
            });
          };
        }

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = mediaStreamRef.current;
          localVideoRef.current.play().catch(() => {});
        }

        setIsCameraOn(true);
        syncLocalTracksToPeers(mediaStreamRef.current);
        broadcastRoomMessage('track-state-changed', {
          from: localPeerIdRef.current,
          peerId: localPeerIdRef.current,
          userId: user?.id,
          isCameraOn: true,
          isMicOn,
          isScreenSharing,
        });
      } catch (err: any) {
        console.error('Camera access failed:', err);
        setDeviceError(
          err?.name === 'NotAllowedError'
            ? 'Camera permission was denied. Please allow camera access in your browser address bar.'
            : err?.message || 'Could not access camera device.'
        );
        setIsCameraOn(false);
      }
    }
  };

  // Hardware: WebRTC Microphone Toggle with Audio Context Meter
  const toggleMic = async () => {
    setDeviceError(null);
    if (isMicOn) {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getAudioTracks().forEach((track) => {
          track.stop();
          mediaStreamRef.current?.removeTrack(track);
        });
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      setMicLevel(0);
      setIsMicOn(false);
      syncLocalTracksToPeers(mediaStreamRef.current);
      broadcastRoomMessage('track-state-changed', {
        from: localPeerIdRef.current,
        peerId: localPeerIdRef.current,
        userId: user?.id,
        isCameraOn,
        isMicOn: false,
        isScreenSharing,
      });
    } else {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setDeviceError('Microphone access is not supported by your browser.');
          return;
        }
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioTrack = audioStream.getAudioTracks()[0];
        if (!mediaStreamRef.current) {
          mediaStreamRef.current = new MediaStream();
        }
        if (audioTrack) {
          // Clean up old audio tracks if any
          mediaStreamRef.current.getAudioTracks().forEach((t) => {
            t.stop();
            mediaStreamRef.current?.removeTrack(t);
          });
          mediaStreamRef.current.addTrack(audioTrack);
          audioTrack.onended = () => {
            setIsMicOn(false);
            setMicLevel(0);
            syncLocalTracksToPeers(mediaStreamRef.current);
            broadcastRoomMessage('track-state-changed', {
              from: localPeerIdRef.current,
              peerId: localPeerIdRef.current,
              userId: user?.id,
              isCameraOn,
              isMicOn: false,
              isScreenSharing,
            });
          };
        }

        // Real-time audio frequency visualizer
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const ctx = new AudioContextClass();
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 64;
            const source = ctx.createMediaStreamSource(audioStream);
            source.connect(analyser);
            audioContextRef.current = ctx;
            analyserRef.current = analyser;

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            const updateMeter = () => {
              if (analyserRef.current) {
                analyserRef.current.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) {
                  sum += dataArray[i] ?? 0;
                }
                const avg = sum / dataArray.length;
                setMicLevel(Math.min(100, Math.round((avg / 128) * 100)));
                animFrameRef.current = requestAnimationFrame(updateMeter);
              }
            };
            updateMeter();
          }
        } catch (e) {
          console.warn('Audio visualization not available:', e);
        }

        setIsMicOn(true);
        syncLocalTracksToPeers(mediaStreamRef.current);
        broadcastRoomMessage('track-state-changed', {
          from: localPeerIdRef.current,
          peerId: localPeerIdRef.current,
          userId: user?.id,
          isCameraOn,
          isMicOn: true,
          isScreenSharing,
        });
      } catch (err: any) {
        console.error('Microphone access failed:', err);
        setDeviceError(
          err?.name === 'NotAllowedError'
            ? 'Microphone permission was denied. Please allow microphone access in your browser address bar.'
            : err?.message || 'Could not access microphone device.'
        );
        setIsMicOn(false);
      }
    }
  };

  // Hardware: WebRTC Screen Sharing Toggle
  const toggleScreenShare = async () => {
    setDeviceError(null);
    if (isScreenSharing) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
        screenStreamRef.current = null;
      }
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = null;
      }
      setIsScreenSharing(false);
      broadcastRoomMessage('track-state-changed', {
        from: localPeerIdRef.current,
        peerId: localPeerIdRef.current,
        userId: user?.id,
        isCameraOn,
        isMicOn,
        isScreenSharing: false,
      });
    } else {
      try {
        if (!navigator.mediaDevices?.getDisplayMedia) {
          setDeviceError('Screen sharing is not supported by your browser.');
          return;
        }
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });
        screenStreamRef.current = stream;
        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = stream;
          screenVideoRef.current.play().catch(() => {});
        }
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.onended = () => {
            if (screenStreamRef.current) {
              screenStreamRef.current.getTracks().forEach((t) => t.stop());
              screenStreamRef.current = null;
            }
            if (screenVideoRef.current) {
              screenVideoRef.current.srcObject = null;
            }
            setIsScreenSharing(false);
            broadcastRoomMessage('track-state-changed', {
              from: localPeerIdRef.current,
              peerId: localPeerIdRef.current,
              userId: user?.id,
              isCameraOn,
              isMicOn,
              isScreenSharing: false,
            });
          };
        }
        setIsScreenSharing(true);
        // Push screen track to all peer connections (triggers pc.onnegotiationneeded)
        Object.values(peerConnectionsRef.current).forEach((pc) => {
          try {
            if (videoTrack) {
              pc.addTrack(videoTrack, stream);
            }
          } catch (e) {
            console.warn('Error adding screen track to peer:', e);
          }
        });
        broadcastRoomMessage('track-state-changed', {
          from: localPeerIdRef.current,
          peerId: localPeerIdRef.current,
          userId: user?.id,
          isCameraOn,
          isMicOn,
          isScreenSharing: true,
        });
      } catch (err: any) {
        if (err?.name !== 'NotAllowedError') {
          console.error('Screen sharing error:', err);
          setDeviceError(err?.message || 'Unable to share screen.');
        }
        setIsScreenSharing(false);
      }
    }
  };

  const handleLeaveRoom = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    broadcastRoomMessage('peer-leave', {
      from: localPeerIdRef.current,
    });
    Object.values(peerConnectionsRef.current).forEach((pc) => {
      try {
        pc.close();
      } catch {}
    });
    peerConnectionsRef.current = {};
    setRemotePeers([]);
    setAdmissionStatus('none');
    setIsCameraOn(false);
    setIsMicOn(false);
    setIsScreenSharing(false);
    setMicLevel(0);
    setIsInLiveRoom(false);
  };

  const handleDeleteLiveClass = async () => {
    if (confirm(`Are you sure you want to end and delete this live class session? This will close the broadcast and delete the session for all learners.`)) {
      broadcastRoomMessage('session-ended', {
        from: localPeerIdRef.current,
        courseId: canonicalRoomId,
      });
      await deleteLiveSession(canonicalRoomId);
      handleLeaveRoom();
      const updated = await fetchCourseModules(canonicalRoomId, courseTitle, course?.category);
      setCourseModules(updated);
    }
  };

  const handleDeleteLiveModule = async (mod: CourseModuleItem) => {
    if (confirm(`Delete live class "${mod.title}" from this course?`)) {
      broadcastRoomMessage('session-ended', {
        from: localPeerIdRef.current,
        courseId: canonicalRoomId,
      });
      await deleteLiveSession(canonicalRoomId);
      await deleteCourseModule(mod.id);
      const updated = await fetchCourseModules(canonicalRoomId, courseTitle, course?.category);
      setCourseModules(updated);
    }
  };

  const handleCopyMeetingLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const courseTitle = course?.title || 'Full Stack Development';
  const targetIp = course?.targetLabIp || template?.defaultHostIp || '10.10.15.50';
  const currentTemplate = template || getCourseLabTemplate(courseTitle, course?.category || 'Web & Software', targetIp);
  const isInstructorOrAdmin = Boolean(user && user.role !== 'learner' && (user.role === 'admin' || user.role === 'instructor'));

  return (
    <div className="min-h-screen flex flex-col bg-[#050508] text-[var(--color-text)] font-sans">
      {/* Top Bar with Lab Target Telemetry */}
      <header className="border-b border-zinc-800/80 px-6 py-3 flex items-center justify-between bg-[#08080E] sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-xs text-zinc-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 text-red-500" />
              <span>Back to Portal</span>
            </Button>
          </Link>

          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <div className="border-l border-zinc-800 pl-3">
              <h1 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{courseTitle}</span>
                <span className="text-[10px] bg-red-950 text-red-400 border border-red-900/40 px-2 py-0.5 rounded font-mono font-bold">
                  {course?.category || 'Web & Software'}
                </span>
              </h1>
              <p className="text-[11px] text-zinc-400 font-mono flex items-center gap-2">
                <span>Target Host: <strong className="text-emerald-400">{targetIp}</strong></span>
                <span>·</span>
                <span>{currentTemplate.devOrAttackPodLabel}: <strong className="text-zinc-300">{currentTemplate.attackPodOrCluster}</strong></span>
                {user?.assignedInstructorName && (
                  <>
                    <span>·</span>
                    <span className="text-amber-400 flex items-center gap-1 font-semibold">
                      <GraduationCap className="w-3 h-3 text-amber-500" />
                      <span>Mentor: {user.assignedInstructorName}</span>
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Live Lab Controls, Instructor Studio & Notifications */}
        <div className="flex items-center gap-3 text-xs font-mono">
          {/* Notification Center */}
          <NotificationCenter />

          {/* Assign Live Class Button (Instructor/Admin only) */}
          {isInstructorOrAdmin && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsScheduleLiveOpen(true)}
              className="bg-red-950/40 border border-red-900/60 text-red-400 hover:bg-red-950/70 text-xs gap-1.5 font-semibold hidden sm:flex"
            >
              <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
              <span>Assign Live Class</span>
            </Button>
          )}

          {/* Instructor Studio Button (Instructor/Admin only) */}
          {isInstructorOrAdmin && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsInstructorStudioOpen(true)}
              className="bg-[#12121E] border-zinc-800 text-zinc-300 hover:text-white text-xs gap-1.5 font-semibold"
            >
              <Upload className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden md:inline">Instructor Studio</span>
            </Button>
          )}

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0E0E16] border border-zinc-800 text-zinc-300">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>01:42:15 remaining</span>
          </div>

          <Button
            variant="secondary"
            size="sm"
            className="bg-[#0E0E16] border-zinc-800 text-zinc-300 hover:text-white text-xs gap-1.5"
            onClick={() => alert(`Environment reset initiated for ${targetIp}`)}
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Reset Lab</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setActiveTab('flags')}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs gap-1.5 shadow-md shadow-red-950/40"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Submit Flag</span>
          </Button>
        </div>
      </header>

      {/* Main Split Interface */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left Curriculum Outline */}
        <aside className={`w-full md:w-80 border-r border-zinc-800/80 bg-[#08080C] p-4 flex flex-col gap-4 ${activeTab === 'live' ? 'hidden md:flex' : 'flex'}`}>
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
              Curriculum Modules
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">
              {flagSubmitted ? '100% Done' : '40% Done'}
            </span>
          </div>

          {user?.assignedInstructorName && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-950/30 border border-amber-900/50 text-xs">
              <GraduationCap className="w-4 h-4 text-amber-500 shrink-0" />
              <div className="flex flex-col truncate">
                <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">Assigned Mentor</span>
                <span className="text-xs font-bold text-white truncate">{user.assignedInstructorName}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 font-mono text-xs">
            {courseModules.map((mod, idx) => {
              const isSelected =
                (mod.type === 'lecture' && activeTab === 'lecture') ||
                (mod.type === 'live' && activeTab === 'live') ||
                (mod.type === 'lab' && (activeTab === 'guide' || activeTab === 'terminal')) ||
                (mod.type === 'notes' && activeTab === 'notes');

              const getModIcon = () => {
                switch (mod.type) {
                  case 'lecture':
                    return <Video className="w-4 h-4 text-red-500 shrink-0" />;
                  case 'live':
                    return <Radio className="w-4 h-4 text-red-400 animate-pulse shrink-0" />;
                  case 'notes':
                    return <FileText className="w-4 h-4 text-amber-400 shrink-0" />;
                  default:
                    return <FileCode className="w-4 h-4 text-emerald-400 shrink-0" />;
                }
              };

              return (
                <button
                  key={mod.id || idx}
                  onClick={() => {
                    if (mod.type === 'lecture') setActiveTab('lecture');
                    else if (mod.type === 'live') {
                      setActiveTab('live');
                      setIsInLiveRoom(true);
                    }
                    else if (mod.type === 'notes') setActiveTab('notes');
                    else setActiveTab('guide');
                  }}
                  className={`p-3 rounded-lg border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-[#141422] border-red-600/80 text-white shadow-sm shadow-red-950/30'
                      : 'bg-[#0A0A10] border-zinc-800/80 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {getModIcon()}
                    <span className="truncate">{mod.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-1.5">
                    <span className={`text-[10px] font-bold ${mod.duration === 'LIVE' || mod.duration === 'LIVE NOW' ? 'text-red-400 animate-pulse' : 'text-zinc-400'}`}>
                      {mod.duration || '40 Min'}
                    </span>
                    {isInstructorOrAdmin && mod.type === 'live' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLiveModule(mod);
                        }}
                        title="Delete this live class module"
                        className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-red-950/60 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </button>
              );
            })}

            {/* Quick Upload Button for Instructors ONLY */}
            {isInstructorOrAdmin && (
              <button
                onClick={() => setIsScheduleLiveOpen(true)}
                className="mt-2 p-2.5 rounded-lg border border-dashed border-red-900/60 bg-red-950/20 hover:bg-red-950/40 text-red-400 text-xs font-mono flex items-center justify-center gap-1.5 transition-all"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>+ Assign Live Class Session</span>
              </button>
            )}
          </div>

          {/* Quick Joining Helper */}
          <div className="mt-auto p-3.5 rounded-xl bg-[#0B0B14] border border-zinc-800 text-xs text-zinc-400 flex flex-col gap-2">
            <span className="text-white font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-red-500" />
              <span>1-Click Live Studio</span>
            </span>
            <p className="text-[11px] leading-relaxed text-zinc-500">
              Students automatically connect with low-latency WebRTC streaming, direct audio Q&amp;A, and real-time screen sharing.
            </p>
          </div>
        </aside>

        {/* Right Active Lab / Classroom View */}
        <main className="flex-1 flex flex-col bg-[#050508] overflow-y-auto">
          {/* Main Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-zinc-800/80 px-6 pt-3 bg-[#08080C] text-xs font-mono overflow-x-auto">
            <button
              onClick={() => setActiveTab('lecture')}
              className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'lecture'
                  ? 'border-red-500 text-white font-bold'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Recorded Lecture</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('live');
                setIsInLiveRoom(true);
              }}
              className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'live'
                  ? 'border-red-500 text-white font-bold'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <Radio className="w-4 h-4 text-red-500 animate-pulse" />
              <span>Live Class &amp; Chat</span>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'guide'
                  ? 'border-red-500 text-white font-bold'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <FileCode className="w-4 h-4" />
              <span>Lab Guide</span>
            </button>

            <button
              onClick={() => setActiveTab('terminal')}
              className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'terminal'
                  ? 'border-red-500 text-white font-bold'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <TerminalIcon className="w-4 h-4" />
              <span>
                {currentTemplate.terminalHostname === 'darkspace-lab' ? 'Web Kali Terminal' : 'Cloud Dev Terminal'}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('notes')}
              className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'notes'
                  ? 'border-red-500 text-white font-bold'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Study Notes &amp; Files</span>
            </button>

            <button
              onClick={() => setActiveTab('flags')}
              className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'flags'
                  ? 'border-red-500 text-white font-bold'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <Flag className="w-4 h-4" />
              <span>Submit Flags</span>
            </button>
          </div>

          {/* TAB 1: RECORDED LECTURE */}
          {activeTab === 'lecture' && (
            <div className="p-6 md:p-8 flex flex-col gap-6 max-w-5xl mx-auto w-full">
              <div className="relative aspect-video w-full bg-[#020204] border border-[#1E1E28] rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between group">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.15),rgba(0,0,0,0.95))] flex items-center justify-center">
                  <div className="text-center p-6 flex flex-col items-center gap-3">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-16 h-16 rounded-full bg-red-600/90 hover:bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-900/50 hover:scale-105 transition-all"
                    >
                      {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1 fill-current" />}
                    </button>
                    <span className="text-xs font-mono text-zinc-400">
                      {isPlaying ? 'Streaming Session In Progress' : 'Click to Play Recorded Lecture'}
                    </span>
                  </div>
                </div>

                <div className="relative z-10 p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-900/60 text-[10px] font-mono font-bold uppercase">
                      4K On-Demand Lecture
                    </span>
                    <span className="text-xs font-bold text-white truncate">{courseTitle} — Full Masterclass</span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">Auto-Resume Active</span>
                </div>

                <div className="relative z-10 p-4 bg-gradient-to-t from-black/90 to-transparent flex flex-col gap-2">
                  <div
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      const pct = Math.round((clickX / rect.width) * 100);
                      setVideoProgress(Math.min(100, Math.max(0, pct)));
                    }}
                    className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden cursor-pointer"
                  >
                    <div className="bg-red-600 h-full rounded-full transition-all" style={{ width: `${videoProgress}%` }} />
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono text-zinc-300">
                    <div className="flex items-center gap-4">
                      <button onClick={() => setIsPlaying(!isPlaying)} className="hover:text-white">
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                      </button>
                      <div className="flex items-center gap-1.5">
                        <Volume2 className="w-4 h-4 text-zinc-400" />
                        <span>18:42 / 48:50</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 bg-zinc-900/80 px-2 py-0.5 rounded border border-zinc-800">
                        {['1x', '1.25x', '1.5x', '2x'].map((s) => (
                          <button
                            key={s}
                            onClick={() => setPlaybackSpeed(s)}
                            className={`px-1.5 rounded ${playbackSpeed === s ? 'text-red-400 font-bold' : 'text-zinc-500 hover:text-white'}`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>

                      <button className="hover:text-white">
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lecture Description & Resources */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 flex flex-col gap-3">
                  <h2 className="text-xl font-bold text-white">Lecture Overview: Core Architecture &amp; Hands-on Implementation</h2>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    In this session, senior instructors guide you through the fundamental building blocks of {courseTitle}.
                    Follow along with your live container cluster in the Terminal tab and review the reference guide.
                  </p>

                  <div className="p-4 bg-[#0B0B12] border border-zinc-800 rounded-xl mt-2 flex flex-col gap-2">
                    <span className="text-xs font-bold text-white font-mono uppercase text-red-400">Chapters:</span>
                    <ul className="text-xs space-y-1.5 font-mono text-zinc-300">
                      <li className="flex items-center justify-between cursor-pointer hover:text-red-400">
                        <span>00:00 — Introduction &amp; Enterprise Architecture</span>
                        <span className="text-zinc-500">08:15</span>
                      </li>
                      <li className="flex items-center justify-between cursor-pointer hover:text-red-400 text-red-400">
                        <span>08:15 — Practical Setup &amp; Environment Initialization</span>
                        <span className="text-zinc-500">18:42</span>
                      </li>
                      <li className="flex items-center justify-between cursor-pointer hover:text-red-400">
                        <span>18:42 — Core Engineering Patterns &amp; Execution</span>
                        <span className="text-zinc-500">32:10</span>
                      </li>
                      <li className="flex items-center justify-between cursor-pointer hover:text-red-400">
                        <span>32:10 — Production Deployment &amp; Code Checkpoint</span>
                        <span className="text-zinc-500">48:50</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Quick Materials */}
                <div className="bg-[#0B0B10] border border-[#1E1E28] rounded-xl p-5 flex flex-col gap-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-red-500" />
                    <span>Lecture Materials</span>
                  </h3>
                  <div className="flex flex-col gap-2 text-xs">
                    {courseNotes.slice(0, 3).map((note) => (
                      <div
                        key={note.id}
                        onClick={() => setActiveTab('notes')}
                        className="p-2.5 rounded-lg bg-[#07070A] border border-zinc-800 hover:border-zinc-700 cursor-pointer flex items-center justify-between text-zinc-300"
                      >
                        <span className="truncate">{note.fileName || note.title}</span>
                        <Download className="w-3.5 h-3.5 text-red-400 shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE INTERACTIVE CLASS & WEBRTC IN-APP STUDIO */}
          {activeTab === 'live' && (
            <div className="flex-1 flex flex-col md:flex-row h-full">
              <div className={`flex-1 p-2 sm:p-4 md:p-6 lg:p-8 flex flex-col gap-3 sm:gap-4 ${mobileLiveView !== 'stage' ? 'hidden md:flex' : 'flex'}`}>
                {/* Mobile Live View Switcher (Stage / Chat / Participants) */}
                {isInLiveRoom && admissionStatus === 'admitted' && (
                  <div className="md:hidden flex items-center justify-between p-1 bg-[#09090F] border border-zinc-800 rounded-xl gap-1 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setMobileLiveView('stage')}
                      className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                        mobileLiveView === 'stage'
                          ? 'bg-red-600 text-white shadow'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Radio className="w-3.5 h-3.5" />
                      <span>Stage</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileLiveView('chat');
                        setLiveSidebarTab('chat');
                      }}
                      className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                        mobileLiveView === 'chat'
                          ? 'bg-red-600 text-white shadow'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat ({chatMessages.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileLiveView('participants');
                        setLiveSidebarTab('participants');
                      }}
                      className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                        mobileLiveView === 'participants'
                          ? 'bg-red-600 text-white shadow'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>People ({1 + uniqueRemotePeers.length})</span>
                    </button>
                  </div>
                )}

                {/* 1. WAITING ROOM SCREEN FOR LEARNERS */}
                {admissionStatus === 'waiting' ? (
                  <div className="relative aspect-video w-full bg-[#020204] border-2 border-amber-600/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between p-6">
                    <div className="flex items-center justify-between z-10">
                      <span className="px-3 py-1 rounded-full bg-amber-950 text-amber-400 border border-amber-800/80 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                        <Clock className="w-3.5 h-3.5" />
                        <span>WAITING ROOM · PERMISSION REQUESTED</span>
                      </span>
                      <span className="text-xs font-mono text-zinc-400">Class: {courseTitle}</span>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center text-center max-w-lg mx-auto gap-4 py-6">
                      <div className="w-16 h-16 rounded-full bg-amber-950/60 border-2 border-amber-500/80 flex items-center justify-center text-amber-400 animate-pulse shadow-xl shadow-amber-950">
                        <Lock className="w-7 h-7" />
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-white">Knocking on Live Classroom...</h3>
                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                          Please wait. The instructor has been notified of your knock and will admit you into the live session shortly.
                        </p>
                      </div>

                      {/* Device check preview while waiting */}
                      <div className="w-full bg-[#09090F] border border-zinc-800 rounded-xl p-3.5 flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-400">Hardware Pre-Check:</span>
                          <span className={isMicOn ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>
                            {isMicOn ? `Mic ON (${micLevel}%)` : 'Mic Muted'}
                          </span>
                          <span className="text-zinc-600">·</span>
                          <span className={isCameraOn ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>
                            {isCameraOn ? 'Camera Active' : 'Camera Off'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={toggleMic}
                            className={`p-1.5 rounded-lg border text-xs ${isMicOn ? 'bg-emerald-600 text-white' : 'bg-zinc-900 border-zinc-700 text-zinc-400'}`}
                            title="Test Mic"
                          >
                            {isMicOn ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={toggleCamera}
                            className={`p-1.5 rounded-lg border text-xs ${isCameraOn ? 'bg-emerald-600 text-white' : 'bg-zinc-900 border-zinc-700 text-zinc-400'}`}
                            title="Test Camera"
                          >
                            {isCameraOn ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {deviceError && (
                      <div className="p-2 rounded-lg bg-red-950/60 border border-red-900/60 text-xs text-red-400 font-mono">
                        Hardware warning: {deviceError}
                      </div>
                    )}

                    <div className="flex items-center justify-between border-t border-zinc-900 pt-3 text-xs font-mono">
                      <span className="text-zinc-400">
                        Live Host: <strong className="text-white">{user?.assignedInstructorName || 'Senior Lead Instructor'}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={handleCancelWaiting}
                        className="text-xs text-red-400 hover:text-red-300 hover:underline"
                      >
                        Cancel Knock &amp; Exit
                      </button>
                    </div>
                  </div>
                ) : isInLiveRoom && admissionStatus === 'admitted' ? (
                  /* 2. ACTIVE LIVE CLASSROOM STUDIO */
                  <div
                    onClick={unlockAudio}
                    onTouchStart={unlockAudio}
                    className="relative w-full min-h-[460px] sm:min-h-[500px] md:min-h-0 md:aspect-video bg-[#020204] border-2 border-red-600/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between group"
                  >
                    {/* Tap to Unmute Floating Prompt (Mobile WebRTC Autoplay policy unlock) */}
                    {needsAudioUnlock && (
                      <button
                        type="button"
                        onClick={unlockAudio}
                        className="absolute top-14 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-full bg-gradient-to-r from-red-600 to-red-800 text-white font-mono text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce cursor-pointer border border-red-400/80"
                      >
                        <Volume2 className="w-4 h-4 animate-pulse text-amber-300" />
                        <span>Tap to Unmute Audio (Mobile)</span>
                      </button>
                    )}

                    {/* Dedicated WebRTC Audio Elements for Mobile & Desktop (Kept in render tree with fixed position & opacity 0.001) */}
                    <div
                      style={{
                        position: 'fixed',
                        top: -9999,
                        left: -9999,
                        width: 1,
                        height: 1,
                        opacity: 0.001,
                        pointerEvents: 'none',
                      }}
                    >
                      {uniqueRemotePeers.map((peer) => (
                        <audio
                          key={`remote-audio-el-${peer.peerId}`}
                          ref={(el) => {
                            if (el) {
                              if (peer.stream && el.srcObject !== peer.stream) {
                                el.srcObject = peer.stream;
                              }
                              el.muted = Boolean(peer.isMutedLocally);
                              el.volume = 1.0;
                              const playPromise = el.play();
                              if (playPromise !== undefined) {
                                playPromise.catch(() => {
                                  setNeedsAudioUnlock(true);
                                });
                              }
                            }
                          }}
                          autoPlay
                          playsInline
                          // @ts-ignore
                          webkit-playsinline="true"
                        />
                      ))}
                    </div>

                    {/* Top Room Banner */}
                    <div className="p-3 sm:p-4 flex items-center justify-between z-20 bg-gradient-to-b from-black/90 to-transparent">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-[10px] font-mono font-bold uppercase tracking-wider animate-pulse">
                          <Radio className="w-3.5 h-3.5" />
                          <span>LIVE STUDIO BROADCAST</span>
                        </span>
                        <span className="text-[11px] font-bold text-white hidden sm:inline truncate max-w-xs">
                          {courseTitle}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-2.5 text-xs font-mono text-zinc-300">
                        {/* Auto-Admit Policy Toggle for Instructor / Admin */}
                        {(user?.role === 'instructor' || user?.role === 'admin') && (
                          <button
                            type="button"
                            onClick={handleToggleAutoAdmit}
                            className={`px-2 sm:px-2.5 py-1 rounded-lg font-bold text-[10px] flex items-center gap-1.5 transition-all shadow-sm ${
                              autoAdmitEveryone
                                ? 'bg-emerald-950/90 text-emerald-400 border border-emerald-800/80'
                                : 'bg-amber-950/90 text-amber-400 border border-amber-800/80'
                            }`}
                            title={autoAdmitEveryone ? 'Auto-Allow is ON (Anyone enters instantly)' : 'Auto-Allow is OFF (Instructor must admit)'}
                          >
                            {autoAdmitEveryone ? <Unlock className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3 text-amber-400" />}
                            <span>{autoAdmitEveryone ? '⚡ Auto-Allow ON' : '🔒 Approval Req.'}</span>
                          </button>
                        )}

                        <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-900/60 text-[10px] font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          CONNECTED
                        </span>

                        {isMicOn && (
                          <span className="px-2 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-900/60 text-[10px] font-bold flex items-center gap-1">
                            <Mic className="w-3 h-3 text-red-400 animate-pulse" />
                            <span>MIC ({micLevel}%)</span>
                          </span>
                        )}

                        <span className="text-zinc-400 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{uniqueRemotePeers.length + 1} in Room</span>
                        </span>
                      </div>
                    </div>

                    {/* Waiting Room Management HUD Banner (Instructor & Admin Only) */}
                    {(user?.role === 'instructor' || user?.role === 'admin') && waitingList.length > 0 && (
                      <div className="mx-2 sm:mx-4 mt-1 p-2.5 bg-amber-950/90 border border-amber-600/80 rounded-xl flex items-center justify-between gap-2 z-20 shadow-xl animate-in fade-in duration-200">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                          <span className="text-xs font-bold text-white font-mono">
                            {waitingList.length} Learner{waitingList.length > 1 ? 's' : ''} in Waiting Room:
                          </span>
                          <span className="text-xs text-amber-300 font-mono truncate max-w-xs">
                            {waitingList.map((w) => w.name).join(', ')}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={handleAdmitAll}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-[11px] flex items-center gap-1"
                          >
                            <UserCheck className="w-3 h-3" />
                            <span>Allow All ({waitingList.length})</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (waitingList[0]) handleAdmitLearner(waitingList[0].id);
                            }}
                            className="px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-emerald-400 hover:text-white font-mono text-[11px]"
                          >
                            Allow Next
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (waitingList[0]) handleDenyLearner(waitingList[0].id);
                            }}
                            className="px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-red-400 font-mono text-[11px]"
                          >
                            Deny
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Center Video & Multi-Participant Stage Viewport */}
                    <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-black p-2 sm:p-3">
                      {/* View 1: Screen Share is Active */}
                      {isScreenSharing ? (
                        <div className="w-full h-full relative flex items-center justify-center bg-black">
                          <video
                            ref={screenVideoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-contain"
                          />
                          <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-lg bg-black/80 border border-red-500/80 text-red-400 text-xs font-mono flex items-center gap-2 backdrop-blur-md">
                            <Monitor className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                            <span>Presenting Screen (Live)</span>
                          </div>

                          {/* Floating PiP Local Video Thumbnail */}
                          {isCameraOn && (
                            <div className="absolute bottom-4 right-4 z-20 w-36 h-24 sm:w-44 sm:h-28 rounded-xl overflow-hidden border-2 border-red-500 shadow-2xl bg-black">
                              <video
                                ref={(el) => {
                                  localVideoRef.current = el;
                                  if (el && mediaStreamRef.current && el.srcObject !== mediaStreamRef.current) {
                                    el.srcObject = mediaStreamRef.current;
                                    el.play().catch(() => {});
                                  }
                                }}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover scale-x-[-1]"
                              />
                              <span className="absolute bottom-1 right-2 text-[9px] font-mono font-bold bg-black/80 px-1.5 py-0.5 rounded text-white">
                                You ({user?.role?.toUpperCase()})
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* View 2: Multi-Participant Two-Way Video Grid (Instructor + Learner + Admin) */
                        <div className={`w-full h-full grid gap-2 sm:gap-3 ${
                          uniqueRemotePeers.length === 0
                            ? 'grid-cols-1 md:grid-cols-2'
                            : uniqueRemotePeers.length === 1
                            ? 'grid-cols-1 md:grid-cols-2'
                            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                        }`}>
                          {/* Tile 1: Local User (You) */}
                          <div className="relative aspect-video rounded-xl overflow-hidden bg-[#0A0A12] border-2 border-red-600/70 shadow-xl flex items-center justify-center">
                            {isCameraOn ? (
                              <video
                                ref={(el) => {
                                  localVideoRef.current = el;
                                  if (el) {
                                    el.muted = true;
                                    el.defaultMuted = true;
                                    el.playsInline = true;
                                    el.setAttribute('playsinline', 'true');
                                    el.setAttribute('webkit-playsinline', 'true');
                                    if (mediaStreamRef.current && el.srcObject !== mediaStreamRef.current) {
                                      el.srcObject = mediaStreamRef.current;
                                      el.play().catch(() => {});
                                    }
                                  }
                                }}
                                autoPlay
                                playsInline
                                // @ts-ignore
                                webkit-playsinline="true"
                                muted={true}
                                onLoadedMetadata={(e) => {
                                  const v = e.currentTarget;
                                  v.muted = true;
                                  v.defaultMuted = true;
                                  v.playsInline = true;
                                  v.play().catch(() => {});
                                }}
                                className="w-full h-full object-cover scale-x-[-1]"
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center gap-2 text-zinc-500">
                                <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 font-bold text-base">
                                  {(user?.name || user?.email || 'Y').charAt(0).toUpperCase()}
                                </div>
                                <span className="text-xs font-mono">Camera is Off</span>
                              </div>
                            )}

                            {/* Local Name Badge */}
                            <div className="absolute top-2.5 left-2.5 z-10 px-2.5 py-1 rounded-lg bg-black/80 border border-zinc-800 text-[10px] font-mono text-white flex items-center gap-1.5 backdrop-blur-md">
                              <span className={`w-2 h-2 rounded-full ${user?.role === 'instructor' ? 'bg-red-500 animate-pulse' : user?.role === 'admin' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                              <span className="font-bold">{user?.name || (user?.email ? user.email.split('@')[0] : 'You')}</span>
                              <span className="text-[9px] text-zinc-400 uppercase">({user?.role || 'Learner'} · You)</span>
                            </div>

                            {/* Local Mic Status */}
                            <div className="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/80 text-[10px] font-mono backdrop-blur-md">
                              {isMicOn ? (
                                <span className="text-emerald-400 flex items-center gap-1">
                                  <Mic className="w-3 h-3 text-emerald-400 animate-pulse" />
                                  <span>MIC ({micLevel}%)</span>
                                </span>
                              ) : (
                                <span className="text-zinc-500 flex items-center gap-1">
                                  <MicOff className="w-3 h-3" />
                                  <span>Muted</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Tile 2+: Remote Peers (Two-Way Live Video & Audio) */}
                          {uniqueRemotePeers.map((peer) => (
                            <RemoteVideoTile
                              key={peer.peerId}
                              peer={peer}
                              onMuteToggle={toggleRemoteAudioMute}
                            />
                          ))}

                          {/* Placeholder Card If Waiting for Other Participant */}
                          {uniqueRemotePeers.length === 0 && (
                            <div className="relative aspect-video rounded-xl overflow-hidden bg-[#06060C] border border-dashed border-zinc-800 p-6 flex flex-col items-center justify-center text-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-red-950/40 border border-red-900/60 flex items-center justify-center text-red-400">
                                <Radio className="w-6 h-6 animate-pulse" />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-white">
                                  {user?.role === 'instructor' ? 'Awaiting Learners to Join' : user?.role === 'admin' ? 'Live Class Monitoring' : 'Awaiting Instructor Video Stream'}
                                </h4>
                                <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                                  Two-way audio and video will connect automatically as soon as another participant enters this classroom.
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={handleCopyMeetingLink}
                                className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-xs font-mono text-zinc-300 flex items-center gap-1.5"
                              >
                                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedLink ? 'Link Copied' : 'Copy Room Link'}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Interactive Bottom Control Bar */}
                    <div className="relative z-20 p-2.5 sm:p-4 bg-gradient-to-t from-black/95 to-transparent flex items-center justify-between gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        {/* Mic Button */}
                        <button
                          type="button"
                          onClick={() => {
                            unlockAudio();
                            toggleMic();
                          }}
                          className={`p-2 sm:p-2.5 rounded-full border transition-all ${
                            isMicOn
                              ? 'bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-950'
                              : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white'
                          }`}
                          title={isMicOn ? 'Mute Mic' : 'Unmute Mic'}
                        >
                          {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                        </button>

                        {/* Camera Button */}
                        <button
                          type="button"
                          onClick={() => {
                            unlockAudio();
                            toggleCamera();
                          }}
                          className={`p-2 sm:p-2.5 rounded-full border transition-all ${
                            isCameraOn
                              ? 'bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-950'
                              : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white'
                          }`}
                          title={isCameraOn ? 'Turn off Camera' : 'Turn on Camera'}
                        >
                          {isCameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                        </button>

                        {/* Screen Share Button */}
                        <button
                          type="button"
                          onClick={() => {
                            unlockAudio();
                            toggleScreenShare();
                          }}
                          className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full border text-[11px] sm:text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                            isScreenSharing
                              ? 'bg-red-600 border-red-500 text-white shadow-md shadow-red-950'
                              : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white hover:border-red-600'
                          }`}
                          title={isScreenSharing ? 'Stop Screen Sharing' : 'Share Screen (Display)'}
                        >
                          {isScreenSharing ? <MonitorOff className="w-3.5 h-3.5" /> : <Monitor className="w-3.5 h-3.5 text-red-500" />}
                          <span className="hidden sm:inline">{isScreenSharing ? 'Stop Sharing' : 'Share Screen'}</span>
                        </button>

                        {/* Raise Hand Button */}
                        <button
                          type="button"
                          onClick={() => {
                            unlockAudio();
                            handleToggleHand();
                          }}
                          className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full border text-[11px] sm:text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                            isHandRaised
                              ? 'bg-amber-600 border-amber-500 text-white shadow-md shadow-amber-950'
                              : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white'
                          }`}
                          title="Raise Hand to Ask Question"
                        >
                          <Hand className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{isHandRaised ? 'Hand Raised' : 'Raise Hand'}</span>
                        </button>

                        {/* Mobile Quick Chat Switcher */}
                        <button
                          type="button"
                          onClick={() => {
                            unlockAudio();
                            setMobileLiveView('chat');
                            setLiveSidebarTab('chat');
                          }}
                          className="md:hidden px-2.5 py-1.5 rounded-full border border-zinc-700 bg-zinc-900 text-zinc-300 text-[11px] font-mono font-bold flex items-center gap-1"
                          title="Open Live Chat"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-red-400" />
                          <span>Chat</span>
                        </button>
                      </div>

                      {/* Right controls: Share link, leave, delete */}
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <button
                          type="button"
                          onClick={handleCopyMeetingLink}
                          className="p-2 sm:px-2.5 sm:py-1.5 rounded-lg bg-zinc-900/80 border border-zinc-700 hover:border-zinc-600 text-zinc-300 hover:text-white text-xs font-mono flex items-center gap-1.5"
                          title="Copy Classroom Room Link"
                        >
                          {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
                          <span className="hidden sm:inline">{copiedLink ? 'Copied' : 'Share'}</span>
                        </button>

                        {/* Leave Room Button */}
                        <button
                          type="button"
                          onClick={handleLeaveRoom}
                          className="px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-md shadow-zinc-950 transition-all"
                          title="Leave Live Studio"
                        >
                          <PhoneOff className="w-3.5 h-3.5 text-red-400" />
                          <span className="hidden sm:inline">Leave</span>
                        </button>

                        {/* End & Delete Class Button (Host / Admin Only) */}
                        {isInstructorOrAdmin && (
                          <button
                            type="button"
                            onClick={handleDeleteLiveClass}
                            className="px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-red-600/90 hover:bg-red-600 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-md shadow-red-950 transition-all"
                            title="End and delete this live class session for all learners"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Delete Class</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 3. LOBBY / PREVIEW STATE */
                  <div className="relative aspect-video w-full bg-[#020204] border border-red-950/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between">
                    <div className="p-4 flex items-center justify-between z-10 bg-gradient-to-b from-black/80 to-transparent">
                      <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-600 text-white text-[10px] font-mono font-bold uppercase tracking-wider animate-pulse">
                        <Radio className="w-3.5 h-3.5" />
                        LIVE STREAM BROADCAST
                      </span>
                      <span className="text-xs font-mono text-zinc-300 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Classroom Ready</span>
                      </span>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                      <div className="w-16 h-16 rounded-full bg-red-950/80 border border-red-800 flex items-center justify-center text-red-400 mb-3">
                        <Radio className="w-8 h-8 animate-ping" />
                      </div>
                      <h3 className="text-base font-bold text-white">Live Cohort Session in Progress</h3>
                      <p className="text-xs text-zinc-400 mt-1 max-w-md">
                        {user?.role === 'admin'
                          ? 'Super Admin Mode: You have direct unrestricted access to enter and supervise any active live session without approval.'
                          : user?.role === 'instructor'
                          ? 'You are the Instructor and Host of this live masterclass. Launch studio to begin broadcasting.'
                          : `Live studio is active for ${courseTitle}. Join the interactive voice, video, screen share, and chat room.`}
                      </p>
                      <div className="flex items-center gap-2.5 mt-4 flex-wrap justify-center">
                        <Button
                          variant="primary"
                          size="md"
                          onClick={handleRequestJoinRoom}
                          className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 font-bold text-xs gap-2 shadow-lg shadow-red-950/50 hover:scale-105 transition-all"
                        >
                          <Radio className="w-4 h-4" />
                          <span>
                            {user?.role === 'admin'
                              ? '🛡️ Join Live Class as Admin (Direct Access) →'
                              : user?.role === 'instructor'
                              ? '🚀 Enter Live Studio as Host →'
                              : '🚀 Join Live Class (1-Click) →'}
                          </span>
                        </Button>

                        {isInstructorOrAdmin && (
                          <Button
                            variant="ghost"
                            size="md"
                            onClick={handleDeleteLiveClass}
                            className="bg-red-950/40 border border-red-900/60 text-red-400 hover:bg-red-950/70 hover:text-white font-mono text-xs gap-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Live Session</span>
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-t from-black/90 to-transparent text-xs font-mono text-zinc-400 flex items-center justify-between">
                      <span>Host: Senior Lead Instructor</span>
                      <span className="text-emerald-400">In-App Live Studio (Zero External Apps)</span>
                    </div>
                  </div>
                )}

                {/* Quick Emoji Reaction Bar (When in live room) */}
                {isInLiveRoom && (
                  <div className="p-3 bg-[#09090F] border border-zinc-800 rounded-xl flex items-center justify-between">
                    <span className="text-xs font-mono text-zinc-400">Instant Reactions:</span>
                    <div className="flex items-center gap-2">
                      {[
                        { emoji: '👍', label: 'Great' },
                        { emoji: '✋', label: 'Question' },
                        { emoji: '🔥', label: 'Awesome' },
                        { emoji: '💡', label: 'Understood' },
                        { emoji: '👏', label: 'Clap' },
                      ].map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => handleQuickReaction(`${item.emoji} ${item.label}`)}
                          className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-red-600 hover:bg-zinc-800 text-xs font-mono flex items-center gap-1 transition-all"
                        >
                          <span>{item.emoji}</span>
                          <span className="text-zinc-400 hover:text-white hidden sm:inline">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Next Live Schedule Banner */}
                <div className="bg-[#0B0B10] border border-[#1E1E28] rounded-xl p-4 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">Scheduled Live Sessions &amp; Cohort Reviews</span>
                    <span className="text-zinc-400 text-[11px]">{courseTitle} Q&amp;A &amp; System Architecture Review</span>
                  </div>
                  {isInstructorOrAdmin && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsScheduleLiveOpen(true)}
                      className="bg-[#12121A] text-xs text-red-400 border-zinc-800 hover:border-red-900/60"
                    >
                      + Assign Next Class
                    </Button>
                  )}
                </div>
              </div>

              {/* Live Classroom Chat & Participants Sidebar */}
              <div className={`${mobileLiveView === 'stage' ? 'hidden md:flex' : 'flex'} w-full md:w-80 border-t md:border-t-0 md:border-l border-zinc-800/80 bg-[#08080C] flex flex-col justify-between p-4`}>
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Mobile Back to Video Stage Header Bar */}
                  <div className="md:hidden pb-3 mb-2 border-b border-zinc-800/80 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setMobileLiveView('stage')}
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-xs font-mono font-bold text-white flex items-center gap-1.5"
                    >
                      <span>← Back to Video Stage</span>
                    </button>
                    <span className="text-[11px] font-mono text-zinc-400 capitalize">
                      {liveSidebarTab}
                    </span>
                  </div>

                  {/* Tab Selector between Chat and Participants */}
                  <div className="pb-3 border-b border-zinc-800 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3 text-xs font-mono">
                      <button
                        type="button"
                        onClick={() => setLiveSidebarTab('chat')}
                        className={`pb-1 border-b-2 font-bold transition-all ${
                          liveSidebarTab === 'chat'
                            ? 'border-red-500 text-white'
                            : 'border-transparent text-zinc-500 hover:text-white'
                        }`}
                      >
                        Live Chat
                      </button>
                      <button
                        type="button"
                        onClick={() => setLiveSidebarTab('participants')}
                        className={`pb-1 border-b-2 font-bold transition-all flex items-center gap-1.5 ${
                          liveSidebarTab === 'participants'
                            ? 'border-red-500 text-white'
                            : 'border-transparent text-zinc-500 hover:text-white'
                        }`}
                      >
                        <span>Participants ({1 + uniqueRemotePeers.length})</span>
                        {isInstructorOrAdmin && waitingList.length > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-400 text-[9px] font-bold border border-amber-500/40 animate-pulse">
                            +{waitingList.length}
                          </span>
                        )}
                      </button>
                    </div>

                    <span className="text-[10px] text-emerald-400 font-mono">● Online</span>
                  </div>

                  {/* TAB A: LIVE CHAT */}
                  {liveSidebarTab === 'chat' ? (
                    <div className="py-4 space-y-3 overflow-y-auto max-h-[380px] flex-1">
                      {chatMessages.length === 0 ? (
                        <div className="py-12 px-4 text-center text-zinc-500 font-mono text-xs flex flex-col items-center gap-2">
                          <Radio className="w-6 h-6 text-zinc-600 animate-pulse" />
                          <span>Live classroom chat connected.</span>
                          <span className="text-[11px] text-zinc-600">Send a question or reaction to start the discussion!</span>
                        </div>
                      ) : (
                        chatMessages.map((msg) => (
                          <div key={msg.id} className="text-xs flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5 font-mono">
                              <span className={`font-bold ${msg.role === 'instructor' || msg.role === 'admin' ? 'text-red-400' : 'text-zinc-300'}`}>
                                {msg.sender}
                              </span>
                              {(msg.role === 'instructor' || msg.role === 'admin') && (
                                <span className="text-[9px] bg-red-950 text-red-400 px-1 rounded border border-red-900/60 font-mono font-bold">
                                  HOST
                                </span>
                              )}
                              <span className="text-[10px] text-zinc-600">{msg.time}</span>
                            </div>
                            <p className="text-zinc-300 bg-[#0D0D14] p-2.5 rounded-lg border border-zinc-900 leading-snug break-words">
                              {msg.text}
                            </p>
                          </div>
                        ))
                      )}
                      <div ref={chatBottomRef} />
                    </div>
                  ) : (
                    /* TAB B: ACTIVE PARTICIPANTS & ADMISSION CONTROLS */
                    <div className="py-4 space-y-3 overflow-y-auto max-h-[380px] text-xs font-mono">
                      {/* Host Admission Management (Instructor / Admin Only) */}
                      {isInstructorOrAdmin && (
                        <div className="p-2.5 rounded-xl bg-[#0A0A12] border border-zinc-800 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-zinc-300 flex items-center gap-1.5">
                              <Shield className="w-3.5 h-3.5 text-red-500" />
                              Admission Control
                            </span>
                            <button
                              type="button"
                              onClick={handleToggleAutoAdmit}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors flex items-center gap-1 ${
                                autoAdmitEveryone
                                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400 hover:bg-emerald-900/70'
                                  : 'bg-amber-950/60 border-amber-800 text-amber-400 hover:bg-amber-900/70'
                              }`}
                            >
                              {autoAdmitEveryone ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                              <span>{autoAdmitEveryone ? 'Auto-Allow ON' : 'Approval Required'}</span>
                            </button>
                          </div>

                          {/* Waiting Queue List if any */}
                          {waitingList.length > 0 && (
                            <div className="pt-2 border-t border-zinc-800/80 space-y-1.5">
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="text-amber-400 font-bold flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> Waiting ({waitingList.length})
                                </span>
                                <button
                                  type="button"
                                  onClick={handleAdmitAll}
                                  className="text-emerald-400 hover:text-emerald-300 font-bold underline text-[10px]"
                                >
                                  Admit All
                                </button>
                              </div>
                              {waitingList.map((learner) => (
                                <div
                                  key={learner.id}
                                  className="p-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-center justify-between gap-1"
                                >
                                  <div className="truncate min-w-0">
                                    <span className="text-white font-bold block truncate">{learner.name}</span>
                                    <span className="text-[9px] text-zinc-500 truncate block">{learner.email}</span>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleAdmitLearner(learner.id)}
                                      className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-0.5"
                                    >
                                      <UserCheck className="w-3 h-3" /> Allow
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDenyLearner(learner.id)}
                                      className="p-1 rounded bg-zinc-800 hover:bg-red-950 hover:text-red-400 text-zinc-400 transition-colors"
                                      title="Deny"
                                    >
                                      <UserX className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Connected Participants List */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block px-1">
                          In Room ({1 + uniqueRemotePeers.length})
                        </span>

                        {/* Local User */}
                        <div className="p-2.5 rounded-lg bg-[#0F0F1A] border border-zinc-800 flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-200 shrink-0">
                              {(user?.name || user?.email || 'Y').charAt(0).toUpperCase()}
                            </div>
                            <div className="truncate">
                              <span className="font-bold text-white block truncate">{user?.name || user?.email || 'You'}</span>
                              <span className="text-[10px] text-zinc-500 capitalize">
                                {user?.role === 'instructor' ? 'Lead Instructor (Host)' : user?.role === 'admin' ? 'Super Admin' : 'Learner'} (You)
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] shrink-0">
                            {isMicOn ? (
                              <span className="text-emerald-400 flex items-center gap-0.5"><Mic className="w-3 h-3" /></span>
                            ) : (
                              <span className="text-zinc-500"><MicOff className="w-3 h-3" /></span>
                            )}
                            {isCameraOn ? (
                              <span className="text-emerald-400"><Video className="w-3 h-3" /></span>
                            ) : (
                              <span className="text-zinc-600"><VideoOff className="w-3 h-3" /></span>
                            )}
                            {isScreenSharing && <span className="text-red-400"><Monitor className="w-3 h-3" /></span>}
                          </div>
                        </div>

                        {/* Remote WebRTC Peers (Two-Way Live Audio & Video Connected) */}
                        {uniqueRemotePeers.map((peer) => (
                          <div
                            key={peer.peerId}
                            className={`p-2.5 rounded-lg border flex items-center justify-between ${
                              peer.role === 'instructor'
                                ? 'bg-red-950/20 border-red-900/40'
                                : peer.role === 'admin'
                                ? 'bg-blue-950/20 border-blue-900/40'
                                : 'bg-[#0B0B14] border-zinc-800/80'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${
                                  peer.role === 'instructor'
                                    ? 'bg-red-600'
                                    : peer.role === 'admin'
                                    ? 'bg-blue-600'
                                    : 'bg-zinc-700'
                                }`}
                              >
                                {peer.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="truncate">
                                <span
                                  className={`font-bold block truncate ${
                                    peer.role === 'instructor' ? 'text-red-400' : peer.role === 'admin' ? 'text-blue-400' : 'text-zinc-200'
                                  }`}
                                >
                                  {peer.name}
                                </span>
                                <span className="text-[10px] text-zinc-500 capitalize">
                                  {peer.role === 'instructor' ? 'Host' : peer.role === 'admin' ? 'Admin' : 'Learner'}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] shrink-0">
                              <button
                                type="button"
                                onClick={() => toggleRemoteAudioMute(peer.peerId)}
                                className={`p-1 rounded hover:bg-zinc-800 transition-colors ${
                                  peer.isMutedLocally ? 'text-red-400' : 'text-emerald-400'
                                }`}
                                title={peer.isMutedLocally ? 'Unmute participant for you' : 'Mute participant for you'}
                              >
                                {peer.isMutedLocally ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                              </button>
                              {peer.isCameraOn ? (
                                <span className="text-emerald-400"><Video className="w-3 h-3" /></span>
                              ) : (
                                <span className="text-zinc-600"><VideoOff className="w-3 h-3" /></span>
                              )}
                              {peer.isScreenSharing && <span className="text-red-400"><Monitor className="w-3 h-3" /></span>}
                            </div>
                          </div>
                        ))}

                        {/* If no other peers yet */}
                        {uniqueRemotePeers.length === 0 && (
                          <div className="py-4 text-center text-zinc-500 text-[11px] font-mono">
                            No other participants connected yet.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSendChat} className="pt-3 border-t border-zinc-800 flex items-center gap-2 shrink-0">
                  <input
                    type="text"
                    value={newChatInput}
                    onChange={(e) => setNewChatInput(e.target.value)}
                    placeholder="Ask question or message cohort..."
                    className="flex-1 bg-[#050508] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-red-600"
                  />
                  <button type="submit" className="p-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white">
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: DYNAMIC LAB GUIDE (TAILORED TO THE COURSE) */}
          {activeTab === 'guide' && (
            <div className="p-8 max-w-3xl flex flex-col gap-6 text-sm text-zinc-300 leading-relaxed">
              <div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Objective: {currentTemplate.objectiveTitle}
                </h2>
                <p className="text-xs text-zinc-400 font-mono">
                  Assigned Track: <strong className="text-red-400">{courseTitle}</strong> · Target IP: <strong className="text-emerald-400">{targetIp}</strong>
                </p>
              </div>

              {currentTemplate.steps.map((step) => (
                <div key={step.stepNumber} className="bg-[#0B0B12] border border-zinc-800/80 rounded-xl p-5 flex flex-col gap-3">
                  <h3 className="font-bold text-white text-xs font-mono uppercase tracking-wider text-red-400">
                    Step {step.stepNumber}: {step.title}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {step.description}
                  </p>
                  <div className="bg-[#050508] border border-zinc-800 p-3 rounded font-mono text-xs text-emerald-400 select-all overflow-x-auto">
                    {step.command}
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-3 pt-4 border-t border-zinc-800/80">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setActiveTab('terminal')}
                  className="bg-red-600 hover:bg-red-700 font-bold text-xs"
                >
                  Switch to {currentTemplate.terminalHostname === 'darkspace-lab' ? 'Kali Terminal' : 'Dev Terminal'} →
                </Button>
              </div>
            </div>
          )}

          {/* TAB 4: INTERACTIVE TERMINAL */}
          {activeTab === 'terminal' && (
            <div className="flex-1 flex flex-col bg-[#050508] p-4">
              <div className="flex-1 bg-[#020204] border border-zinc-800/80 rounded-xl p-4 font-mono text-xs text-zinc-300 flex flex-col justify-between overflow-hidden shadow-inner">
                <div className="overflow-y-auto space-y-1.5">
                  <div className="text-zinc-500 pb-2 border-b border-zinc-900 flex items-center justify-between">
                    <span>DarkSpace Virtual Environment ({currentTemplate.terminalHostname})</span>
                    <span className="text-emerald-400">● Connected: {targetIp}</span>
                  </div>
                  {terminalHistory.map((line, idx) => (
                    <div
                      key={idx}
                      className={
                        line.startsWith(`${currentTemplate.terminalUser}@`) || line.startsWith('kali@') || line.startsWith('developer@')
                          ? 'text-red-400 font-bold'
                          : line.includes('PORT') || line.includes('status') || line.includes('BUILD') || line.includes('UP')
                          ? 'text-zinc-200'
                          : line.startsWith('DSS{')
                          ? 'text-emerald-400 font-black'
                          : 'text-zinc-400'
                      }
                    >
                      {line}
                    </div>
                  ))}
                </div>

                <form onSubmit={handleCommandSubmit} className="mt-4 pt-3 border-t border-zinc-900 flex items-center gap-2">
                  <span className="text-red-500 font-bold">{currentTemplate.terminalUser}@{currentTemplate.terminalHostname}:~$</span>
                  <input
                    type="text"
                    value={terminalCommand}
                    onChange={(e) => setTerminalCommand(e.target.value)}
                    placeholder="Type command (e.g. curl, docker, npm, python3, whoami, clear)..."
                    className="flex-1 bg-transparent border-none outline-none text-white font-mono text-xs"
                    autoFocus
                  />
                  <Button type="submit" size="sm" variant="secondary" className="text-xs font-mono bg-zinc-900 border-zinc-800">
                    Execute
                  </Button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 5: STUDY NOTES & FILES */}
          {activeTab === 'notes' && (
            <div className="p-8 max-w-4xl flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-red-500" />
                    <span>Study Notes, Cheatsheets &amp; Resources</span>
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Download official instructor lecture notes, architecture diagrams, and cheatsheets for <strong>{courseTitle}</strong>.
                  </p>
                </div>

                {isInstructorOrAdmin && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsInstructorStudioOpen(true)}
                    className="bg-red-600 hover:bg-red-700 text-xs font-bold gap-1.5 self-start sm:self-auto"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload New Notes</span>
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courseNotes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-[#0B0B12] border border-zinc-800/80 rounded-xl p-5 flex flex-col justify-between gap-4 hover:border-zinc-700 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mb-2">
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" />
                          <span>DOCUMENT</span>
                        </span>
                        <span>{note.fileSize || '3.2 MB'}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{note.title}</h4>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{note.description}</p>
                    </div>

                    <div className="pt-3 border-t border-zinc-900 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-zinc-500 truncate max-w-[180px]">
                        {note.fileName}
                      </span>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => alert(`Initiating download for ${note.fileName}`)}
                        className="bg-[#12121A] border-zinc-800 text-zinc-300 hover:text-white text-xs gap-1.5"
                      >
                        <Download className="w-3 h-3 text-red-400" />
                        <span>Download</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: FLAG / MILESTONE SUBMISSION */}
          {activeTab === 'flags' && (
            <div className="p-8 max-w-xl flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Flag className="w-5 h-5 text-red-500" />
                  <span>Submit Lab Flag &amp; Milestone</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Format: <code>DSS&#123;milestone_token_here&#125;</code>. Submissions are verified instantaneously.
                </p>
              </div>

              {flagSubmitted ? (
                <div className="p-5 rounded-xl border border-emerald-600/40 bg-emerald-950/20 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <CheckCircle className="w-5 h-5" />
                    <span>MILESTONE VERIFIED! 100% Progress Awarded</span>
                  </div>
                  <p className="text-xs text-zinc-300">
                    Validation complete. Your progress has been updated on your Learner Profile.
                  </p>
                  <Link href="/" className="mt-2">
                    <Button variant="secondary" size="sm" className="bg-[#12121A] text-xs">
                      ← Return to Learner Hub
                    </Button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleFlagSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono text-zinc-400">ENTER MILESTONE TOKEN</label>
                    <input
                      type="text"
                      value={flagInput}
                      onChange={(e) => setFlagInput(e.target.value)}
                      placeholder="DSS{milestone_token_...}"
                      className="px-3.5 py-2.5 rounded-lg bg-[#0E0E14] border border-zinc-800 text-white font-mono text-xs focus:border-red-500 outline-none"
                      required
                    />
                  </div>

                  <Button type="submit" variant="primary" size="md" className="bg-red-600 hover:bg-red-700 text-xs font-bold gap-2">
                    <Send className="w-4 h-4" />
                    <span>Verify &amp; Submit</span>
                  </Button>
                </form>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Instructor Studio Modal */}
      <InstructorStudioModal
        isOpen={isInstructorStudioOpen}
        onClose={() => setIsInstructorStudioOpen(false)}
        courseId={canonicalRoomId}
        courseTitle={courseTitle}
        onSuccess={loadCourseData}
      />

      {/* Schedule Live Class Modal */}
      <ScheduleLiveClassModal
        isOpen={isScheduleLiveOpen}
        onClose={() => setIsScheduleLiveOpen(false)}
        defaultCourseId={canonicalRoomId}
        defaultCourseTitle={courseTitle}
        onSuccess={loadCourseData}
      />
    </div>
  );
}
