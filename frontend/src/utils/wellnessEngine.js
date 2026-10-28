/**
 * PharmaSure Built-in Clinical Mental Support & Wellness Engine
 * Provides empathetic, evidence-based psychological and medication guidance
 * seamlessly without requiring external cloud connectivity.
 */

export function generateWellnessResponse(userPrompt) {
  const q = (userPrompt || "").toLowerCase().trim();

  // 1. Critical Crisis & Emergency Triggers
  if (
    q.includes("suicide") ||
    q.includes("kill myself") ||
    q.includes("end my life") ||
    q.includes("self harm") ||
    q.includes("want to die") ||
    q.includes("hurt myself")
  ) {
    return `### 🚨 Urgent: Please Reach Out for Immediate Support

You are not alone, and there is compassionate, free, confidential support available right now 24/7:

* **India (Tele-MANAS)**: 📞 **14416** or **1800-891-4416** (Toll-Free, 24x7 National Mental Health Helpline)
* **KIRAN Helpline**: 📞 **1800-599-0019**
* **Vandrevala Foundation**: 📞 **9999 666 555** (WhatsApp / Call)
* **USA & Canada**: 📞 **988** (Suicide & Crisis Lifeline)
* **UK**: 📞 **111** or text **SHOUT** to **85258**
* **Emergency Services**: Please call **112** (India/EU) or **911** (US) or go to the nearest emergency room immediately.

Please speak to a trusted friend, family member, or mental health professional right away. People care about you and want to help. ❤️`;
  }

  // 2. Anxiety, Panic Attack, Racing Thoughts
  if (
    q.includes("anxiety") ||
    q.includes("anxious") ||
    q.includes("panic") ||
    q.includes("palpitation") ||
    q.includes("nervous") ||
    q.includes("racing heart") ||
    q.includes("overwhelmed")
  ) {
    return `### 🧘 Calming Your Mind: Quick Relief for Anxiety

I hear you, and it's completely okay to feel this way. Let's take a moment together to slow down your nervous system:

#### 1. The 4-7-8 Deep Breathing Technique
1. **Inhale quietly** through your nose for **4 seconds**.
2. **Hold your breath** gently for **7 seconds**.
3. **Exhale completely** through your mouth making a soft whoosh sound for **8 seconds**.
*Repeat this cycle 4 times. This physically stimulates your vagus nerve to lower heart rate.*

#### 2. The 5-4-3-2-1 Grounding Method
Look around your current space and identify:
* **5 things** you can see
* **4 things** you can physically touch
* **3 things** you can hear
* **2 things** you can smell
* **1 thing** you can taste or are grateful for

Remember: **This feeling is temporary and it will pass.** Sip a glass of cold water and give yourself permission to pause.`;
  }

  // 3. Sleep Issues & Insomnia
  if (
    q.includes("sleep") ||
    q.includes("insomnia") ||
    q.includes("can't sleep") ||
    q.includes("cant sleep") ||
    q.includes("awake") ||
    q.includes("restless") ||
    q.includes("nightmare")
  ) {
    return `### 😴 Restful Sleep Protocol & Wind-Down Guide

Trouble sleeping is often our mind processing lingering stress. Here are clinical sleep hygiene strategies you can use tonight:

#### Immediate Bedroom Adjustments:
* **Digital Sunset**: Put away screens (phones, laptops, TV) at least 30–45 minutes before sleep; blue light blocks melatonin secretion.
* **The 20-Minute Rule**: If you cannot fall asleep after 20 minutes in bed, get up, move to a dimly lit chair, and read a physical book or listen to calming sounds until you feel sleepy.
* **Cool Environment**: Keep your bedroom cool (around 18°C–20°C / 65°F–68°F); a drop in core body temperature signals sleep onset.

#### Guided Progressive Body Scan:
Close your eyes in bed and consciously relax each muscle group starting from your toes, moving up through your calves, thighs, stomach, shoulders, jaw, and forehead.

*Note: If insomnia persists for more than 2 weeks, consult your doctor to evaluate underlying causes or review medication timing.*`;
  }

  // 4. Stress, Work Pressure, Burnout
  if (
    q.includes("stress") ||
    q.includes("stressed") ||
    q.includes("burnout") ||
    q.includes("work") ||
    q.includes("pressure") ||
    q.includes("exhausted") ||
    q.includes("tired")
  ) {
    return `### 🌿 Managing Stress & Preventing Burnout

When stress accumulates, breaking it down into actionable micro-steps helps regain a sense of calm and control:

1. **The 2-Minute "Brain Dump"**:
   Write down everything swirling in your head onto a piece of scrap paper. Once on paper, pick **just one** small item to handle today and park the rest.
2. **Physiological Sigh (Instant Reset)**:
   Take two quick inhales through the nose, followed by one long, slow exhale through the mouth. Doing this twice immediately recalibrates autonomic stress levels.
3. **Physical Decompression**:
   * Step away from your desk or screen for a 5-minute walk.
   * Drink a tall glass of room-temperature water.
   * Unclench your jaw and drop your shoulders away from your ears.

You do not have to solve everything in one day. Focus only on the next single step.`;
  }

  // 5. Medication Timing, Missing a Dose, Interactions
  if (
    q.includes("miss") ||
    q.includes("forgot") ||
    q.includes("missed dose") ||
    q.includes("side effect") ||
    q.includes("timing") ||
    q.includes("tablet") ||
    q.includes("pill") ||
    q.includes("medicine")
  ) {
    return `### 💊 Medication Safety & Adherence Advice

Maintaining a regular medication schedule is key to steady therapeutic blood levels:

#### What to Do If You Missed a Dose:
* **General Rule**: Take the missed dose as soon as you remember.
* **Close to Next Dose?**: If it is almost time for your next scheduled dose, **skip the missed dose** and resume your normal schedule.
* **⚠️ Never Double Up**: Never take two doses together to compensate for a missed tablet, as this can cause sudden toxicity or hypotension.

#### Essential Dispensing Safety:
1. **Food Timing**: Always check whether your prescription is marked *Before Food (AC)* (e.g. PPIs like Pantoprazole) or *After Food (PC)* (e.g. NSAID pain relievers like Dolo, Ibuprofen).
2. **Hydration**: Swallow tablets with a full glass of water.
3. **Storage**: Keep medicines in a cool, dry place away from direct sunlight and bathroom humidity.

*If you experience unexpected symptoms (rash, swelling, dizziness), contact your prescribing doctor or pharmacist immediately.*`;
  }

  // 6. Depression, Loneliness, Low Mood
  if (
    q.includes("sad") ||
    q.includes("depressed") ||
    q.includes("depression") ||
    q.includes("lonely") ||
    q.includes("crying") ||
    q.includes("hopeless") ||
    q.includes("unhappy")
  ) {
    return `### 💙 Gentle Support for Low Mood & Difficult Days

I am genuinely sorry you are going through this. Feeling down, heavy, or disconnected can feel exhausting, but your feelings are valid.

#### Gentle Steps for Today:
* **Micro-Wins**: Don't worry about big productivity goals. Getting out of bed, brushing your teeth, or drinking a glass of water is a complete victory today.
* **10 Minutes of Sunlight**: Natural daylight helps regulate serotonin and circadian rhythm. Try sitting near an open window or balcony.
* **Reach Out to One Person**: Send a simple text or wave to a friend, family member, or colleague. You don't have to explain everything—just a brief connection can help.
* **Self-Compassion**: Talk to yourself the same way you would talk to a close friend who is hurting.

Remember that therapy and counseling provide safe spaces to work through these emotions. If you'd like, Tele-MANAS (14416) is available free 24/7 to listen.`;
  }

  // 7. Breathing, Meditation & Mindfulness
  if (
    q.includes("breath") ||
    q.includes("meditat") ||
    q.includes("mindful") ||
    q.includes("calm") ||
    q.includes("relax")
  ) {
    return `### 🌬️ Quick Guided Mindfulness & Breathing Exercise

Let's do a 2-minute centering session right now:

1. **Sit comfortably** with your feet flat on the floor and hands resting gently in your lap.
2. **Drop your shoulders** and gently close your eyes or soften your gaze.
3. **Notice your breath**: Don't force anything—just observe the cool air entering your nostrils and the warm air leaving.
4. **Box Breathing**:
   * Inhale for 4 seconds
   * Hold for 4 seconds
   * Exhale for 4 seconds
   * Pause for 4 seconds
5. When your mind wanders (which is completely normal), gently bring your attention back to the sensation of your chest rising and falling.

You can listen to our recommended audio and video resources below for relaxing soundscapes!`;
  }

  // 8. General Health, Greetings & Conversational Inquiries
  return `### 👋 Hello! I'm Your PharmaSure Health & Wellness Assistant

I'm here to support your mental wellbeing, stress management, sleep hygiene, and medication routine.

#### How I Can Help You Today:
* **🧘 Manage Stress & Anxiety**: Guided breathing (4-7-8, Box Breathing), grounding exercises, and calming routines.
* **😴 Improve Sleep Quality**: Clinical sleep hygiene protocols and wind-down checklists.
* **💊 Medication Questions**: Guidance on missed doses, prescription timing, and safe adherence.
* **🌿 Emotional Support**: Empathetic listening, burnout reduction, and daily wellness habits.

Feel free to ask me anything—for example:
* *"I feel very anxious right now, what can I do?"*
* *"What should I do if I missed my morning medication?"*
* *"I can't fall asleep, can you guide me?"*

How are you feeling today? Let me know what's on your mind!`;
}
