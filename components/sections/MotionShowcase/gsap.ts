// GSAP for the motion showcase only; the rest of the site keeps its own light motion engine.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger, MotionPathPlugin, MorphSVGPlugin);

export { gsap, ScrollTrigger };
