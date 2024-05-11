buildscript {
    repositories {
        // maven {setUrl("https://maven.aliyun.com/repository/public/")}
        google()
        mavenCentral()
    }
    dependencies {
        classpath("com.android.tools.build:gradle:8.0.0")
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:1.6.21")
    }
}

allprojects {
    repositories {
        maven {setUrl("https://maven.aliyun.com/repository/central/")}
        google()
        mavenCentral()
    }
}

tasks.register("clean").configure {
    delete("build")
}

