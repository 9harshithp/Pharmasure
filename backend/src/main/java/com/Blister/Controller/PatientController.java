package com.Blister.Controller;

import com.Blister.Entity.Admin;
import com.Blister.Entity.Patient;
import com.Blister.Repository.AdminRepository;
import com.Blister.Repository.PatientRepository;
import com.Blister.security.InputSanitizer;
import com.Blister.security.JwtUtil;
import com.Blister.security.PasswordUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
public class PatientController {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordUtil passwordUtil;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private InputSanitizer inputSanitizer;

    // 🔹 Get Patient by ID (Protected)
    @GetMapping("/getById/{id}")
    public ResponseEntity<?> getPatientById(@PathVariable Integer id) {
        Optional<Patient> optionalPatient = patientRepository.findById(id);

        if (optionalPatient.isPresent()) {
            Patient p = optionalPatient.get();
            p.setPassword(null); // Never expose password in response
            return ResponseEntity.ok(p);
        } else {
            return ResponseEntity.status(404).body("❌ Patient not found!");
        }
    }

    // 🔹 Register new patient (Public)
    @PostMapping("/register")
    public ResponseEntity<String> registerPatient(@RequestBody Patient patient) {
        if (patient == null) {
            return ResponseEntity.badRequest().body("Invalid patient data.");
        }

        // Sanitize and validate inputs
        String sanitizedName = inputSanitizer.sanitizeText(patient.getName(), 100);
        String email = patient.getEmail() != null ? patient.getEmail().trim().toLowerCase() : "";
        String careTakerEmail = patient.getCareTakerEmail() != null ? patient.getCareTakerEmail().trim().toLowerCase() : "";
        String rawPassword = patient.getPassword();

        if (sanitizedName == null || sanitizedName.isEmpty()) {
            return ResponseEntity.badRequest().body("Full name is required.");
        }
        if (!inputSanitizer.isValidEmail(email)) {
            return ResponseEntity.badRequest().body("A valid patient email address is required.");
        }
        if (rawPassword == null || rawPassword.trim().length() < 6) {
            return ResponseEntity.badRequest().body("Password must be at least 6 characters long.");
        }
        if (!careTakerEmail.isEmpty() && !inputSanitizer.isValidEmail(careTakerEmail)) {
            return ResponseEntity.badRequest().body("Please enter a valid caretaker email address.");
        }

        if (patientRepository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already registered!");
        }

        // Set sanitized values and securely hash password
        patient.setName(sanitizedName);
        patient.setEmail(email);
        patient.setPassword(passwordUtil.hashPassword(rawPassword));
        patient.setCareTakerEmail(careTakerEmail.isEmpty() ? null : careTakerEmail);
        patient.setDescription(inputSanitizer.sanitizeText(patient.getDescription(), 255));
        patient.setBp(inputSanitizer.sanitizeText(patient.getBp(), 50));
        patient.setRegularDoctor(inputSanitizer.sanitizeText(patient.getRegularDoctor(), 100));

        patientRepository.save(patient);

        // Notify patient via email without exposing plaintext credentials
        String message = String.format(
                "💖 Hello %s,\n\n" +
                        "Welcome to our HealthCare System! 🎉\n" +
                        "We are delighted to have you onboard.\n\n" +
                        "👉 Account Details:\n" +
                        "Email: %s\n" +
                        "Password: [Protected & Encrypted]\n\n" +
                        "Your account has been secured with high-grade BCrypt encryption.\n" +
                        "If you ever need help, your caretaker is here to support you. 🤗\n\n" +
                        "Stay healthy & take care!\n\n💊 Your HealthCare Team",
                patient.getName(),
                patient.getEmail()
        );

        try {
            sendEmail(patient.getEmail(), "Welcome to HealthCare! 💖", message);
        } catch (Exception ignored) {}

        if (patient.getCareTakerEmail() != null && !patient.getCareTakerEmail().isEmpty()) {
            try {
                sendEmail(patient.getCareTakerEmail(), "CareTaker Notification 💌",
                        "Hello CareTaker,\n\nYour patient " + patient.getName() +
                                " has registered successfully with email: " + patient.getEmail() + ".\n\n" +
                                "Please support them with love & care 💖.\n\nThanks,\nHealthCare Team");
            } catch (Exception ignored) {}
        }

        return ResponseEntity.ok("Registration successful! Account secured and confirmation dispatched.");
    }

    private void sendEmail(String to, String subject, String text) {
        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo(to);
        mail.setSubject(subject);
        mail.setText(text);
        mailSender.send(mail);
    }

    // 🔹 Update existing patient by ID
    @PutMapping("/update/{id}")
    public ResponseEntity<String> updatePatient(@PathVariable Integer id, @RequestBody Patient updatedPatient) {
        Optional<Patient> optionalPatient = patientRepository.findById(id);
        if (optionalPatient.isPresent()) {
            Patient patient = optionalPatient.get();

            if (updatedPatient.getName() != null) {
                patient.setName(inputSanitizer.sanitizeText(updatedPatient.getName(), 100));
            }
            if (updatedPatient.getEmail() != null && inputSanitizer.isValidEmail(updatedPatient.getEmail())) {
                patient.setEmail(updatedPatient.getEmail().trim().toLowerCase());
            }
            if (updatedPatient.getPassword() != null && !updatedPatient.getPassword().trim().isEmpty()) {
                patient.setPassword(passwordUtil.hashPassword(updatedPatient.getPassword()));
            }
            if (updatedPatient.getCareTakerEmail() != null) {
                String cEmail = updatedPatient.getCareTakerEmail().trim().toLowerCase();
                if (cEmail.isEmpty() || inputSanitizer.isValidEmail(cEmail)) {
                    patient.setCareTakerEmail(cEmail.isEmpty() ? null : cEmail);
                }
            }

            patientRepository.save(patient);
            return ResponseEntity.ok("Patient updated successfully!");
        } else {
            return ResponseEntity.status(404).body("Patient not found!");
        }
    }

    // DTO for login
    public static class LoginRequest {
        public String email;
        public String password;
    }

    // 🔹 Authenticate & Issue JWT Token (Public)
    @PostMapping("/login")
    public ResponseEntity<?> loginPatient(@RequestBody LoginRequest loginRequest) {
        if (loginRequest == null || loginRequest.email == null || loginRequest.password == null) {
            return ResponseEntity.badRequest().body("❌ Email and password are required.");
        }

        String email = loginRequest.email.trim().toLowerCase();
        String password = loginRequest.password;

        // 1. Check if user is a Patient
        Patient patient = patientRepository.findByEmail(email);
        if (patient != null) {
            if (!passwordUtil.checkPassword(password, patient.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("❌ Invalid credentials!");
            }

            // Upgrade legacy password to BCrypt hash seamlessly
            if (passwordUtil.needsRehash(patient.getPassword())) {
                patient.setPassword(passwordUtil.hashPassword(password));
                patientRepository.save(patient);
            }

            String token = jwtUtil.generateToken(patient.getEmail(), "patient", patient.getPid());

            patient.setPassword(null); // Never return password in payload
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("role", "patient");
            response.put("patient", patient);
            return ResponseEntity.ok(response);
        }

        // 2. Check if user is a Caretaker
        Patient caretakerOf = patientRepository.findByCareTakerEmail(email);
        if (caretakerOf != null) {
            if (!passwordUtil.checkPassword(password, caretakerOf.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("❌ Invalid credentials!");
            }

            if (passwordUtil.needsRehash(caretakerOf.getPassword())) {
                caretakerOf.setPassword(passwordUtil.hashPassword(password));
                patientRepository.save(caretakerOf);
            }

            String token = jwtUtil.generateToken(caretakerOf.getCareTakerEmail(), "caretaker", caretakerOf.getPid());

            caretakerOf.setPassword(null);
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("role", "caretaker");
            response.put("patient", caretakerOf);
            return ResponseEntity.ok(response);
        }

        // 3. Check if user is an Admin / Pharmacist
        Admin admin = adminRepository.findByEmail(email);
        if (admin != null) {
            if (!passwordUtil.checkPassword(password, admin.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("❌ Invalid credentials!");
            }

            // Upgrade legacy admin password to BCrypt hash seamlessly
            if (passwordUtil.needsRehash(admin.getPassword())) {
                admin.setPassword(passwordUtil.hashPassword(password));
                adminRepository.save(admin);
            }

            String token = jwtUtil.generateToken(admin.getEmail(), "PHARMASURE", admin.getId());

            admin.setPassword(null);
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("role", "PHARMASURE");
            response.put("admin", admin);
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("❌ User not found!");
    }

    // 🔹 Set patient alert to true
    @PutMapping("/setAlert/{id}")
    public ResponseEntity<String> setAlertTrue(@PathVariable Integer id) {
        Optional<Patient> optionalPatient = patientRepository.findById(id);

        if (optionalPatient.isPresent()) {
            Patient patient = optionalPatient.get();
            patient.setAlert(true);
            patientRepository.save(patient);
            return ResponseEntity.ok("🚨 Alert set to TRUE for patient: " + patient.getName());
        } else {
            return ResponseEntity.status(404).body("❌ Patient not found!");
        }
    }

    @PutMapping("/clearAlert/{id}")
    public ResponseEntity<String> clearAlert(@PathVariable Integer id) {
        Optional<Patient> optionalPatient = patientRepository.findById(id);

        if (optionalPatient.isPresent()) {
            Patient patient = optionalPatient.get();
            patient.setAlert(false);
            patientRepository.save(patient);
            return ResponseEntity.ok("✅ Alert cleared (set to FALSE) for patient: " + patient.getName());
        } else {
            return ResponseEntity.status(404).body("❌ Patient not found!");
        }
    }

    // UPDATE patient profile by ID
    @PutMapping("/patients/update/{pid}")
    public ResponseEntity<?> updatePatientprofile(@PathVariable Integer pid, @RequestBody Patient updatedPatient) {
        try {
            Optional<Patient> optionalPatient = patientRepository.findById(pid);
            if (!optionalPatient.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Patient with ID " + pid + " not found");
            }

            Patient patient = optionalPatient.get();

            // Sanitize & update fields
            if (updatedPatient.getName() != null) {
                patient.setName(inputSanitizer.sanitizeText(updatedPatient.getName(), 100));
            }
            if (updatedPatient.getEmail() != null && inputSanitizer.isValidEmail(updatedPatient.getEmail())) {
                patient.setEmail(updatedPatient.getEmail().trim().toLowerCase());
            }
            if (updatedPatient.getPassword() != null && !updatedPatient.getPassword().trim().isEmpty()) {
                patient.setPassword(passwordUtil.hashPassword(updatedPatient.getPassword()));
            }
            if (updatedPatient.getDescription() != null) {
                patient.setDescription(inputSanitizer.sanitizeText(updatedPatient.getDescription(), 255));
            }
            if (updatedPatient.getBp() != null) {
                patient.setBp(inputSanitizer.sanitizeText(updatedPatient.getBp(), 50));
            }
            if (updatedPatient.getRegularDoctor() != null) {
                patient.setRegularDoctor(inputSanitizer.sanitizeText(updatedPatient.getRegularDoctor(), 100));
            }
            if (updatedPatient.getCareTakerEmail() != null) {
                String ct = updatedPatient.getCareTakerEmail().trim().toLowerCase();
                if (ct.isEmpty() || inputSanitizer.isValidEmail(ct)) {
                    patient.setCareTakerEmail(ct.isEmpty() ? null : ct);
                }
            }

            patientRepository.save(patient);
            patient.setPassword(null);

            return ResponseEntity.ok(patient);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating patient profile");
        }
    }
}